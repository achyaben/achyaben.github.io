import { supabase } from '@app/supabase';
import type { Order } from '../../types';
import { STORAGE_KEYS } from '../../constants';

const RECENT_ORDER_LIMIT = 5;

function getCachedOrders(): Order[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!saved) return [];

    const orders = JSON.parse(saved);
    return Array.isArray(orders) ? orders : [];
  } catch (e) {
    console.warn('Failed to load local orders:', e);
    return [];
  }
}

function saveCachedOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.warn('Failed to save local orders:', e);
  }
}

function getRecentCachedOrders(limit = RECENT_ORDER_LIMIT): Order[] {
  return [...getCachedOrders()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function mergeWithCachedOrder(apiOrder: Order, cachedOrders = getCachedOrders()): Order {
  const cached = cachedOrders.find(
    (order) => order.id === apiOrder.id || order.trackingId === apiOrder.trackingId
  );

  if (!cached) return apiOrder;

  return {
    ...cached,
    ...apiOrder,
    items: apiOrder.items.length ? apiOrder.items : cached.items,
    customer: cached.customer || apiOrder.customer,
    notes: cached.notes ?? apiOrder.notes,
    status: apiOrder.status,
    cancel_reason: apiOrder.cancel_reason,
    cancelled_at: apiOrder.cancelled_at,
    updatedAt: apiOrder.updatedAt,
  };
}

function saveMergedCachedOrders(updatedOrders: Order[], cachedOrders = getCachedOrders()) {
  const mergedOrders = [...cachedOrders];

  updatedOrders.forEach((order) => {
    const existingIndex = mergedOrders.findIndex(
      (cached) => cached.id === order.id || cached.trackingId === order.trackingId
    );
    if (existingIndex > -1) {
      mergedOrders[existingIndex] = order;
    } else {
      mergedOrders.push(order);
    }
  });

  saveCachedOrders(mergedOrders);
}

function mapOrderRow(o: any, itemMode: 'full' | 'summary' | 'none' = 'full'): Order {
  const items =
    itemMode === 'full'
      ? (o.items || []).map((i: any) => ({
          item: {
            id: i.menu_item?.id || i.menu_item_id || 'unknown',
            name: i.menu_item?.name || 'Unknown Item',
            price: Number(i.price_at_order || 0),
            description: i.menu_item?.description || '',
            category: i.menu_item?.category || '',
            image: i.menu_item?.image || '',
            available: true,
          },
          quantity: Number(i.quantity || 0),
          subtotal: Number(i.line_total || i.quantity * i.price_at_order || 0),
          customizations: i.customizations?.map((c: any) => c.customization_option_id) || [],
        }))
      : itemMode === 'summary'
        ? (o.items || []).map((i: any) => ({
            item: {
              id: 'summary',
              name: '',
              price: 0,
              description: '',
              category: '',
              image: '',
              available: true,
            },
            quantity: Number(i.quantity || 0),
            subtotal: 0,
            customizations: [],
          }))
        : [];

  const calculatedTotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);

  return {
    id: o.id,
    trackingId: o.tracking_id,
    items,
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
      name: 'Me',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
      },
    },
  } as Order;
}

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

    try {
      const orders = getCachedOrders();
      const finalOrder = {
        ...orderData,
        id: orderId || payload.id,
        trackingId: payload.trackingId,
      } as Order;

      const existingIndex = orders.findIndex(
        (o) => o.id === finalOrder.id || o.trackingId === finalOrder.trackingId
      );
      if (existingIndex > -1) {
        orders[existingIndex] = finalOrder;
      } else {
        orders.push(finalOrder);
      }

      saveCachedOrders(orders);
    } catch (e) {
      console.warn('Failed to save order locally:', e);
    }

    return { orderId, trackingId: payload.trackingId, success: true };
  },

  getCachedOrders,
  getRecentCachedOrders,

  // Get lightweight order summaries for history screens.
  async getRecentOrderSummaries(): Promise<Order[]> {
    const cachedOrders = getCachedOrders();
    const recentCachedOrders = getRecentCachedOrders();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return recentCachedOrders;
    const userId = session.user.id;

    const { data: apiData, error } = await supabase
      .from('orders')
      .select(
        'id, tracking_id, total, status, payment_method, payment_status, delivery_datetime, order_type, created_at, updated_at, cancel_reason, cancelled_at, items:order_items(quantity)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(RECENT_ORDER_LIMIT);

    if (error) {
      console.warn('Failed to fetch API order summaries:', error);
      return recentCachedOrders;
    }

    if (!apiData) return recentCachedOrders;

    const freshOrders = apiData.map((o: any) =>
      mergeWithCachedOrder(mapOrderRow(o, 'summary'), cachedOrders)
    );
    saveMergedCachedOrders(freshOrders, cachedOrders);
    return freshOrders;
  },

  async getOrderStatus(trackingId: string): Promise<Order | null> {
    const cachedOrders = getCachedOrders();
    const cachedOrder = cachedOrders.find((o) => o.trackingId === trackingId) || null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return cachedOrder;

    const { data: apiData, error } = await supabase
      .from('orders')
      .select(
        'id, tracking_id, total, status, payment_method, payment_status, delivery_datetime, order_type, created_at, updated_at, cancel_reason, cancelled_at'
      )
      .eq('user_id', session.user.id)
      .eq('tracking_id', trackingId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch API order status:', error);
      return cachedOrder;
    }

    if (!apiData) return cachedOrder;

    const freshOrder = mergeWithCachedOrder(mapOrderRow(apiData, 'none'), cachedOrders);
    saveMergedCachedOrders([freshOrder], cachedOrders);
    return freshOrder;
  },

  async getOrderDetail(trackingId: string): Promise<Order | null> {
    const cachedOrders = getCachedOrders();
    const cachedOrder = cachedOrders.find((o) => o.trackingId === trackingId) || null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return cachedOrder;

    const { data, error } = await supabase
      .from('orders')
      .select(
        '*, items:order_items(*, menu_item:menu_items(*), customizations:order_item_customizations(customization_option_id))'
      )
      .eq('user_id', session.user.id)
      .eq('tracking_id', trackingId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch API order detail:', error);
      return cachedOrder;
    }

    if (!data) return cachedOrder;

    const freshOrder = mergeWithCachedOrder(mapOrderRow(data), cachedOrders);
    saveMergedCachedOrders([freshOrder], cachedOrders);
    return freshOrder;
  },

  async getOrderSummaries(): Promise<Order[]> {
    return this.getRecentOrderSummaries();
  },

  // Legacy helper retained for callers that need customer order list data.
  async getOrders(): Promise<Order[]> {
    return this.getRecentOrderSummaries();
  },

  // Get order by tracking ID
  async getOrderByTrackingId(trackingId: string): Promise<Order | null> {
    const cachedOrders = getCachedOrders();
    const cachedOrder = cachedOrders.find((o) => o.trackingId === trackingId) || null;
    return cachedOrder ? this.getOrderStatus(trackingId) : this.getOrderDetail(trackingId);
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
    const orders = await this.getRecentOrderSummaries();
    return (
      orders
        .filter((order) => !['completed', 'cancelled'].includes(order.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ||
      null
    );
  },
};
