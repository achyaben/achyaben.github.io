import { supabase } from '@app/supabase';
import type { Order } from '../../types';
import { STORAGE_KEYS } from '../../constants';

export const ordersApi = {
  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<any> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Cast to any to cleanly access properties and avoid Partial<T> checks
    const payload = orderData as any;

    // 1. Update Profile (if customer data exists)
    if (payload.customer) {
      const {
        name,
        phone,
        address: customerAddress,
        company,
        postalCode: custPostalCode,
      } = payload.customer;
      const nameParts = (name || '').split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      const addressStr =
        typeof customerAddress === 'string'
          ? customerAddress
          : `${customerAddress?.postalCode || ''} ${customerAddress?.prefecture || ''} ${customerAddress?.city || ''} ${customerAddress?.street || ''}`.trim();

      let postcode = custPostalCode || ''; // Prefer top-level postalCode

      if (!postcode && typeof customerAddress === 'object') {
        postcode = customerAddress?.postalCode || '';
      } else if (!postcode && typeof customerAddress === 'string') {
        // Try to extract postcode from string if not provided separately
        const match = customerAddress.match(/[〒]?\s*(\d{3}-?\d{4})/);
        if (match) {
          postcode = match[1];
        }
      }

      const updatePayload: any = {
        f_name: fName,
        l_name: lName,
        tel: phone,
        address: addressStr,
        postcode: postcode,
        updated_at: new Date().toISOString(),
      };
      if (company) updatePayload.corporate_name = company;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to update profile:', profileError);
        // Non-blocking, continue
      }
    }

    // 2. Insert Order transactionally via RPC
    const orderInsertPayload = {
      tracking_id: payload.trackingId,
      total: payload.total,
      delivery_datetime: payload.deliveryTime,
      payment_method: payload.paymentMethod || 'cash',
      order_type: payload.order_type || 'delivery',
      notes: payload.notes,
      items: (payload.items || []).map((item: any) => ({
        menu_item_id: item.item.id,
        quantity: item.quantity,
        customizations:
          item.customizations?.map((optId: any) =>
            typeof optId === 'string' ? optId : optId.id
          ) || [],
      })),
    };

    const { data: orderId, error: orderError } = await supabase.rpc('create_complete_order', {
      payload: orderInsertPayload,
    });

    if (orderError) {
      console.error('Order insertion failed:', orderError);
      throw orderError;
    }

    // Since RPC only returns the ID, construct minimal order object for local cache mapping
    const order = {
      id: orderId,
      tracking_id: payload.trackingId,
    };

    // Save to local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const orders = saved ? JSON.parse(saved) : [];

      const finalOrder = {
        ...orderData, // Use original payload for local state
        id: order.id || payload.id,
        trackingId: order.tracking_id || payload.trackingId,
      };

      const existingIndex = orders.findIndex((o: any) => o.id === finalOrder.id);
      if (existingIndex > -1) {
        orders[existingIndex] = finalOrder;
      } else {
        orders.push(finalOrder);
      }

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save order locally:', e);
    }

    return { orderId: order.id, trackingId: order.tracking_id, success: true };
  },

  // Get all orders
  async getOrders(): Promise<Order[]> {
    let orders: Order[] = [];

    // 1. Load from Cache (Fast Initial Paint)
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        orders = JSON.parse(saved);
        // Basic sanity check
        if (!Array.isArray(orders)) orders = [];
      }
    } catch (e) {
      console.warn('Failed to load local orders:', e);
    }

    // 2. Fetch Fresh Data from Supabase (Source of Truth)
    // getSession() reads from local cache — no network call
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return orders;
    const userId = session.user.id;

    const { data: apiData, error } = await supabase
      .from('orders')
      .select(
        '*, items:order_items(*, menu_item:menu_items(*), customizations:order_item_customizations(customization_option_id))'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch API orders:', error);
      // Fallback: Return cached orders if API fails
      return orders;
    }

    if (apiData) {
      // Map API data to Order interface
      const freshOrders = apiData.map((o: any) => {
        const items = (o.items || []).map((i: any) => ({
          item: {
            id: i.menu_item?.id || 'unknown',
            name: i.menu_item?.name || 'Unknown Item',
            price: Number(i.price_at_order),
            description: i.menu_item?.description || '', // Added default
            category: i.menu_item?.category || '',
            image: i.menu_item?.image || '',
            available: true,
          },
          quantity: Number(i.quantity),
          subtotal: Number(i.line_total || i.quantity * i.price_at_order),
          customizations: i.customizations?.map((c: any) => c.customization_option_id) || [],
        }));

        const calculatedTotal = items.reduce(
          (sum: number, item: any) => sum + (item.subtotal || 0),
          0
        );

        return {
          id: o.id,
          trackingId: o.tracking_id,
          items: items,
          total: o.total ? Number(o.total) : calculatedTotal,
          status: o.status,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          deliveryTime: o.delivery_datetime,
          order_type: o.order_type,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
          cancel_reason: o.cancel_reason ?? null,
          cancelled_at: o.cancelled_at ?? null,
          customer: {
            name: 'Me', // RLS restricted
            phone: '', // Could fetch profile if needed
            address: {
              street: '',
              city: '',
              postalCode: '',
            },
          },
        } as Order;
      });

      // 3. Update Cache & Return Fresh Data
      // Supabase is the Truth. We overwrite local storage completely.
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(freshOrders));
      return freshOrders;
    }

    return orders;
  },

  // Get order by tracking ID
  async getOrderByTrackingId(trackingId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.trackingId === trackingId) || null;
  },

  // Update an order (staff/manager role usually required)
  async updateOrder(updatedOrder: Order): Promise<Order> {
    // Customer app usually doesn't update orders directly except maybe cancelling
    console.warn('updateOrder not implemented for customer app');
    return updatedOrder;
  },

  // Cancel an order (customer self-cancel — RLS enforces time window)
  async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by_id: user.id,
        cancel_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
    return true;
  },

  // Get most recent pending order
  async getMostRecentPendingOrder(): Promise<Order | null> {
    const orders = await this.getOrders();
    return (
      orders
        .filter((order) => !['completed', 'cancelled'].includes(order.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ||
      null
    );
  },
};
