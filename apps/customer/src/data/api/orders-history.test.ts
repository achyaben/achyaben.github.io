import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ordersApi } from './orders';
import { STORAGE_KEYS } from '../../constants';

const database = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  selects: [] as string[],
}));

vi.mock('@app/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'customer' } } } }),
    },
    from: () => {
      const result = { data: database.rows.shift(), error: null };
      const query = {
        select: (columns: string) => {
          database.selects.push(columns);
          return query;
        },
        eq: () => query,
        order: () => query,
        limit: async () => ({ ...result, data: [result.data] }),
        maybeSingle: async () => result,
      };
      return query;
    },
  },
}));

const orderRow = {
  id: 'order-1',
  tracking_id: 'HISTORY-1',
  total: 1500,
  status: 'accepted',
  created_at: '2026-10-25T00:00:00Z',
};

const detailRow = {
  ...orderRow,
  items: [
    {
      menu_item_id: 'curry',
      menu_item: { id: 'curry', name: 'Curry' },
      quantity: 1,
      price_at_order: 1000,
      line_total: 1000,
      customizations: [{ customization_option_id: 'spicy' }],
    },
    {
      menu_item_id: 'salad',
      menu_item: { id: 'salad', name: 'Salad' },
      quantity: 1,
      price_at_order: 500,
      line_total: 500,
    },
  ],
};

describe('customer order details cache', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    database.rows.length = 0;
    database.selects.length = 0;
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])(
    'history followed by opening an order retains dish details (previously cached: %s)',
    async (previouslyCached) => {
      if (previouslyCached) {
        database.rows.push(detailRow);
        const detail = await ordersApi.getOrderDetail('HISTORY-1');
        expect(detail?.items.map(({ item }) => item.name)).toEqual(['Curry', 'Salad']);
      }

      database.rows.push({ ...orderRow, items: [{ quantity: 1 }, { quantity: 1 }] });
      await ordersApi.getRecentOrderSummaries();

      if (previouslyCached) {
        expect(ordersApi.getCachedOrders()[0].items.map(({ item }) => item.name)).toEqual([
          'Curry',
          'Salad',
        ]);
      }

      database.rows.push(previouslyCached ? orderRow : detailRow);
      const reopened = await ordersApi.getOrderByTrackingId('HISTORY-1');

      expect(reopened?.items.map(({ item }) => item.name)).toEqual(['Curry', 'Salad']);
      expect(reopened?.items.map(({ item }) => item.id)).toEqual(['curry', 'salad']);
      expect(reopened?.items.map(({ subtotal }) => subtotal)).toEqual([1000, 500]);
      expect(reopened?.items[0].customizations).toEqual(['spicy']);
      expect(reopened?.total).toBe(1500);
      expect(database.selects[database.selects.length - 1].includes('order_items')).toBe(
        !previouslyCached
      );

      database.rows.push({ ...orderRow, status: 'completed', payment_status: 'completed' });
      const refreshed = await ordersApi.getOrderByTrackingId('HISTORY-1');
      expect(refreshed?.status).toBe('completed');
      expect(refreshed?.paymentStatus).toBe('completed');
      expect(refreshed?.items).toEqual(reopened?.items);
      expect(database.selects[database.selects.length - 1]).not.toContain('order_items');
    }
  );

  it('fetches full details when opening an order without any cached entry', async () => {
    database.rows.push(detailRow);
    const detail = await ordersApi.getOrderByTrackingId('HISTORY-1');
    expect(detail?.items.map(({ item }) => item.name)).toEqual(['Curry', 'Salad']);
    expect(database.selects[database.selects.length - 1]).toContain('order_items');
  });

  it('repairs an existing cache with only some dish details missing', async () => {
    database.rows.push(detailRow);
    const detail = await ordersApi.getOrderDetail('HISTORY-1');
    if (!detail) throw new Error('Expected order details');
    detail.items[1].item.name = '';
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([detail]));

    database.rows.push(detailRow);
    const repaired = await ordersApi.getOrderByTrackingId('HISTORY-1');
    expect(repaired?.items.map(({ item }) => item.name)).toEqual(['Curry', 'Salad']);
    expect(database.selects[database.selects.length - 1]).toContain('order_items');
  });
});
