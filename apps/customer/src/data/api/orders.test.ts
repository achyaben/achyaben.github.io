import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ordersApi } from './orders';

type QueryResult = {
  data: unknown[] | null;
  error: Error | null;
};

type QueryBuilder = {
  update: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  then: Promise<QueryResult>['then'];
};

const supabaseMock = vi.hoisted(() => {
  const results: QueryResult[] = [];
  const builders: QueryBuilder[] = [];
  let user: { id: string } | null = { id: 'customer-user-id' };

  const createBuilder = (result: QueryResult) => {
    const builder: QueryBuilder = {
      update: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      select: vi.fn(() => builder),
      then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
    };
    builders.push(builder);
    return builder;
  };

  return {
    results,
    builders,
    from: vi.fn(() => createBuilder(results.shift() ?? { data: [], error: null })),
    setUser: (nextUser: { id: string } | null) => {
      user = nextUser;
    },
    getUser: vi.fn(async () => ({ data: { user } })),
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

describe('customer ordersApi cancellation', () => {
  beforeEach(() => {
    supabaseMock.results.length = 0;
    supabaseMock.builders.length = 0;
    supabaseMock.from.mockClear();
    supabaseMock.getUser.mockClear();
    supabaseMock.setUser({ id: 'customer-user-id' });
  });

  it('returns true only when Supabase returns an updated row', async () => {
    supabaseMock.results.push({ data: [{ id: 'order-id' }], error: null });

    await expect(ordersApi.cancelOrder('order-id', 'mistake')).resolves.toBe(true);

    expect(supabaseMock.builders[0].update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'cancelled',
        cancelled_by_id: 'customer-user-id',
        cancel_reason: 'mistake',
      })
    );
    expect(supabaseMock.builders[0].select).toHaveBeenCalledWith('id');
  });

  it('returns false when RLS/status/time rules cause zero rows to update', async () => {
    supabaseMock.results.push({ data: [], error: null });

    await expect(ordersApi.cancelOrder('order-id', 'too late')).resolves.toBe(false);
  });

  it('does not attempt cancellation when there is no authenticated user', async () => {
    supabaseMock.setUser(null);

    await expect(ordersApi.cancelOrder('order-id', 'mistake')).resolves.toBe(false);

    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('returns the newest non-completed and non-cancelled recent order', async () => {
    const getRecentOrderSummaries = vi.fn(async () => [
      {
        id: 'completed-order',
        trackingId: 'DONE',
        status: 'completed',
        createdAt: '2026-09-15T03:00:00.000Z',
      },
      {
        id: 'cancelled-order',
        trackingId: 'STOP',
        status: 'cancelled',
        createdAt: '2026-09-15T04:00:00.000Z',
      },
      {
        id: 'older-active-order',
        trackingId: 'OLD',
        status: 'accepted',
        createdAt: '2026-09-15T01:00:00.000Z',
      },
      {
        id: 'newer-active-order',
        trackingId: 'NEW',
        status: 'pending',
        createdAt: '2026-09-15T02:00:00.000Z',
      },
    ]);

    await expect(
      ordersApi.getMostRecentPendingOrder.call({ getRecentOrderSummaries })
    ).resolves.toMatchObject({
      id: 'newer-active-order',
      trackingId: 'NEW',
    });
  });
});
