import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ORDER_STATUS } from '../constants/orderStatus';
import { ordersApi } from './orders';

type QueryResult = {
  data: unknown[] | null;
  error: Error | null;
};

type QueryBuilder = {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  then: Promise<QueryResult>['then'];
};

const supabaseMock = vi.hoisted(() => {
  const results: QueryResult[] = [];
  const builders: QueryBuilder[] = [];

  const createBuilder = (result: QueryResult) => {
    const builder: QueryBuilder = {
      select: vi.fn(() => builder),
      order: vi.fn(() => builder),
      update: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      neq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      or: vi.fn(() => builder),
      then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
    };
    builders.push(builder);
    return builder;
  };

  return {
    results,
    builders,
    from: vi.fn(() => createBuilder(results.shift() ?? { data: [], error: null })),
    getUser: vi.fn(async () => ({ data: { user: { id: 'admin-user-id' } } })),
  };
});

vi.mock('@app/supabase', () => ({
  supabase: {
    from: supabaseMock.from,
    auth: {
      getUser: supabaseMock.getUser,
    },
  },
}));

describe('admin ordersApi', () => {
  beforeEach(() => {
    supabaseMock.results.length = 0;
    supabaseMock.builders.length = 0;
    supabaseMock.from.mockClear();
    supabaseMock.getUser.mockClear();
  });

  it('pre-filters orders by selected JST delivery date or cancellation date', async () => {
    supabaseMock.results.push({ data: [], error: null });

    await ordersApi.getOrders({ deliveryDate: '2026-09-15' });

    expect(supabaseMock.from).toHaveBeenCalledWith('orders_with_customer');
    expect(supabaseMock.builders[0].or).toHaveBeenCalledWith(
      [
        'and(delivery_datetime.gte.2026-09-14T15:00:00.000Z,delivery_datetime.lt.2026-09-15T15:00:00.000Z)',
        'and(cancelled_at.gte.2026-09-14T15:00:00.000Z,cancelled_at.lt.2026-09-15T15:00:00.000Z)',
      ].join(',')
    );
  });

  it('only completes orders that are currently delivering', async () => {
    supabaseMock.results.push({ data: [{ id: 'order-id' }], error: null });

    await expect(ordersApi.updateOrderStatus('order-id', ORDER_STATUS.completed)).resolves.toBe(
      true
    );

    expect(supabaseMock.builders[0].neq).toHaveBeenCalledWith('status', ORDER_STATUS.cancelled);
    expect(supabaseMock.builders[0].in).toHaveBeenCalledWith('status', [ORDER_STATUS.delivering]);
  });

  it('only moves ready orders into delivering', async () => {
    supabaseMock.results.push({ data: [{ id: 'order-id' }], error: null });

    await expect(ordersApi.updateOrderStatus('order-id', ORDER_STATUS.delivering)).resolves.toBe(
      true
    );

    expect(supabaseMock.builders[0].neq).toHaveBeenCalledWith('status', ORDER_STATUS.cancelled);
    expect(supabaseMock.builders[0].in).toHaveBeenCalledWith('status', [ORDER_STATUS.ready]);
  });

  it('only moves prep queue orders into ready', async () => {
    supabaseMock.results.push({ data: [{ id: 'order-id' }], error: null });

    await expect(ordersApi.updateOrderStatus('order-id', ORDER_STATUS.ready)).resolves.toBe(true);

    expect(supabaseMock.builders[0].neq).toHaveBeenCalledWith('status', ORDER_STATUS.cancelled);
    expect(supabaseMock.builders[0].in).toHaveBeenCalledWith('status', [
      ORDER_STATUS.pending,
      ORDER_STATUS.accepted,
      ORDER_STATUS.preparing,
    ]);
  });

  it('returns false when a status update matched zero rows', async () => {
    supabaseMock.results.push({ data: [], error: null });

    await expect(ordersApi.updateOrderStatus('order-id', ORDER_STATUS.completed)).resolves.toBe(
      false
    );
  });

  it('cancels through the explicit cancellation path and reports zero-row updates as failure', async () => {
    supabaseMock.results.push({ data: [], error: null });

    await expect(ordersApi.cancelOrder('order-id', 'mistake')).resolves.toBe(false);

    expect(supabaseMock.builders[0].update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ORDER_STATUS.cancelled,
        cancelled_by_id: 'admin-user-id',
        cancel_reason: 'mistake',
      })
    );
    expect(supabaseMock.builders[0].neq).toHaveBeenCalledWith('status', ORDER_STATUS.cancelled);
  });

  it('excludes cancelled orders from order summaries and groups by JST delivery date', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 'active-order',
          tracking_id: 'A1',
          total: 1200,
          delivery_datetime: '2026-09-14T15:30:00.000Z',
          status: ORDER_STATUS.completed,
          payment_method: 'cash',
          payment_status: 'pending',
          items: [],
        },
        {
          id: 'cancelled-order',
          tracking_id: 'C1',
          total: 9999,
          delivery_datetime: '2026-09-14T16:00:00.000Z',
          status: ORDER_STATUS.cancelled,
          payment_method: 'paypay',
          payment_status: 'pending',
          cancelled_at: '2026-09-14T16:05:00.000Z',
          items: [],
        },
      ],
      error: null,
    });

    await expect(ordersApi.getOrderSummaries()).resolves.toEqual([
      {
        date: '2026-09-15',
        totalOrders: 1,
        totalRevenue: 1200,
        cash: 1200,
        card: 0,
        paypay: 0,
      },
    ]);
  });
});
