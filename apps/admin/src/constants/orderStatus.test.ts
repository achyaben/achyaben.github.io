import { describe, expect, it } from 'vitest';
import {
  canBulkUpdateToStatus,
  isCancelledStatus,
  isCompactBoardHiddenStatus,
  isDeliveryListHiddenStatus,
  isKitchenStatusHidden,
  isPrepQueueStatus,
  ORDER_DISPLAY_STATUSES,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  type OrderStatus,
} from './orderStatus';

describe('admin order status rules', () => {
  it('keeps cancelled out of the normal workflow but visible as a display status', () => {
    expect(ORDER_STATUS_FLOW).not.toContain(ORDER_STATUS.cancelled);
    expect(ORDER_DISPLAY_STATUSES).toContain(ORDER_STATUS.cancelled);
    expect(isCancelledStatus(ORDER_STATUS.cancelled)).toBe(true);
  });

  it('only allows safe bulk transitions and always skips cancelled orders', () => {
    const statuses = ORDER_DISPLAY_STATUSES;

    expect(canBulkUpdateToStatus(ORDER_STATUS.pending, ORDER_STATUS.ready)).toBe(true);
    expect(canBulkUpdateToStatus(ORDER_STATUS.accepted, ORDER_STATUS.ready)).toBe(true);
    expect(canBulkUpdateToStatus(ORDER_STATUS.preparing, ORDER_STATUS.ready)).toBe(true);
    expect(canBulkUpdateToStatus(ORDER_STATUS.ready, ORDER_STATUS.delivering)).toBe(true);
    expect(canBulkUpdateToStatus(ORDER_STATUS.delivering, ORDER_STATUS.completed)).toBe(true);

    expect(canBulkUpdateToStatus(ORDER_STATUS.pending, ORDER_STATUS.completed)).toBe(false);
    expect(canBulkUpdateToStatus(ORDER_STATUS.accepted, ORDER_STATUS.completed)).toBe(false);
    expect(canBulkUpdateToStatus(ORDER_STATUS.preparing, ORDER_STATUS.completed)).toBe(false);
    expect(canBulkUpdateToStatus(ORDER_STATUS.ready, ORDER_STATUS.completed)).toBe(false);

    for (const target of statuses) {
      expect(canBulkUpdateToStatus(ORDER_STATUS.cancelled, target)).toBe(false);
    }
  });

  it('centralizes queue/visibility status groups', () => {
    expect(isPrepQueueStatus(ORDER_STATUS.pending)).toBe(true);
    expect(isPrepQueueStatus(ORDER_STATUS.accepted)).toBe(true);
    expect(isPrepQueueStatus(ORDER_STATUS.preparing)).toBe(true);
    expect(isPrepQueueStatus(ORDER_STATUS.ready)).toBe(false);

    expect(isDeliveryListHiddenStatus(ORDER_STATUS.completed)).toBe(true);
    expect(isDeliveryListHiddenStatus(ORDER_STATUS.cancelled)).toBe(true);
    expect(isDeliveryListHiddenStatus(ORDER_STATUS.ready)).toBe(false);

    expect(isCompactBoardHiddenStatus(ORDER_STATUS.delivering)).toBe(true);
    expect(isCompactBoardHiddenStatus(ORDER_STATUS.completed)).toBe(true);
    expect(isCompactBoardHiddenStatus(ORDER_STATUS.cancelled)).toBe(false);

    const hiddenKitchenStatuses: OrderStatus[] = [
      ORDER_STATUS.ready,
      ORDER_STATUS.delivering,
      ORDER_STATUS.completed,
    ];
    expect(hiddenKitchenStatuses.every(isKitchenStatusHidden)).toBe(true);
    expect(isKitchenStatusHidden(ORDER_STATUS.cancelled)).toBe(false);
  });
});
