import { supabase } from '@app/supabase';
import type { Order } from '../types/types';

const JST_DATE_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const ordersApi = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders_with_customer')
      .select(
        `
                *,
                items:order_items(
                    *,
                    menu_item:menu_items(name, price),
                    customizations:order_item_customizations(
                        option:customization_options(
                            name, 
                            price_add, 
                            sort_order,
                            group:customization_groups(sort_order, is_required)
                        )
                    )
                )
            `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return (data || []).map((order: any) => ({
      id: order.id,
      trackingId: order.tracking_id || order.id.slice(0, 8),
      customer: {
        name: `${order.customer_f_name || ''} ${order.customer_l_name || ''}`.trim() || 'Unknown',
        phone: order.customer_tel || '',
        address: {
          street: order.customer_address || '',
          city: '',
          postalCode: order.customer_postcode || '',
          instructions: order.notes || '',
        },
        company: order.customer_company || '',
      },
      items: (order.items || []).map((i: any) => ({
        id: i.menu_item_id,
        name: i.menu_item?.name || 'Unknown',
        quantity: i.quantity,
        price: i.price_at_order,
        options: (i.customizations || []).map((c: any) => ({
          name: c.option?.name || '',
          choice: c.option?.name || '',
          price: c.option?.price_add || 0,
          sort_order: c.option?.sort_order || 0,
          group_sort_order: c.option?.group?.sort_order || 0,
          group_required: c.option?.group?.is_required || false,
        })),
      })),
      total: Number(order.total),
      status: order.status as any,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      deliveryTime: order.delivery_datetime,
      paymentMethod: order.payment_method as any,
      paymentStatus: order.payment_status as any,
      orderType: order.order_type as any,
      comments: order.notes,
      cancel_reason: order.cancel_reason ?? null,
      cancelled_at: order.cancelled_at ?? null,
    }));
  },

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to update order status:', error);
      return false;
    }

    return true;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by_id: user?.id ?? null,
        cancel_reason: reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
    return true;
  },

  async assignDriver(orderId: string, driverId: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ user_id: driverId, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    return !error;
  },

  async unassignDriver(orderId: string): Promise<boolean> {
    // This might need careful handling if user_id is NOT NULL
    const { error } = await supabase
      .from('orders')
      .update({ user_id: null as any, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    return !error;
  },

  async getOrderSummaries(): Promise<any[]> {
    const orders = await this.getOrders();
    const summaries: Record<string, any> = {};
    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      // Use deliveryTime for grouping summaries as requested by the user
      if (!order.deliveryTime) return;
      const date = JST_DATE_FORMATTER.format(new Date(order.deliveryTime));

      if (!summaries[date]) {
        summaries[date] = { date, totalOrders: 0, totalRevenue: 0, cash: 0, card: 0, paypay: 0 };
      }
      summaries[date].totalOrders += 1;
      summaries[date].totalRevenue += order.total;
      if (order.paymentMethod === 'cash') summaries[date].cash += order.total;
      if (order.paymentMethod === 'card') summaries[date].card += order.total;
      if (order.paymentMethod === 'paypay') summaries[date].paypay += order.total;
    });
    return Object.values(summaries);
  },
};
