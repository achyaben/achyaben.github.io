import type { Order } from '../types/types';

export type OrderStatus = Order['status'];

export const ORDER_STATUS = {
  pending: 'pending',
  accepted: 'accepted',
  preparing: 'preparing',
  ready: 'ready',
  delivering: 'delivering',
  completed: 'completed',
  cancelled: 'cancelled',
} as const satisfies Record<OrderStatus, OrderStatus>;

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  ORDER_STATUS.pending,
  ORDER_STATUS.accepted,
  ORDER_STATUS.preparing,
  ORDER_STATUS.ready,
  ORDER_STATUS.delivering,
  ORDER_STATUS.completed,
];

export const ORDER_DISPLAY_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, ORDER_STATUS.cancelled];

export const ORDER_BULK_TARGET_SOURCE_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [ORDER_STATUS.ready]: [ORDER_STATUS.pending, ORDER_STATUS.accepted, ORDER_STATUS.preparing],
  [ORDER_STATUS.delivering]: [ORDER_STATUS.ready],
  [ORDER_STATUS.completed]: [ORDER_STATUS.delivering],
};

const PREP_QUEUE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.pending,
  ORDER_STATUS.accepted,
  ORDER_STATUS.preparing,
];

export function isCancelledStatus(status: string | null | undefined): boolean {
  return status === ORDER_STATUS.cancelled;
}

export function isCompletedStatus(status: string | null | undefined): boolean {
  return status === ORDER_STATUS.completed;
}

export function isPrepQueueStatus(status: OrderStatus): boolean {
  return PREP_QUEUE_STATUSES.includes(status);
}

export function isDeliveryListHiddenStatus(status: OrderStatus): boolean {
  return isCompletedStatus(status) || isCancelledStatus(status);
}

export function isCompactBoardHiddenStatus(status: OrderStatus): boolean {
  return status === ORDER_STATUS.delivering || isCompletedStatus(status);
}

export function isKitchenStatusHidden(status: OrderStatus): boolean {
  return (
    status === ORDER_STATUS.ready || status === ORDER_STATUS.delivering || isCompletedStatus(status)
  );
}

export function canBulkUpdateToStatus(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (isCancelledStatus(currentStatus)) return false;
  return ORDER_BULK_TARGET_SOURCE_STATUSES[targetStatus]?.includes(currentStatus) ?? false;
}

export function canWriteStatusFromCurrent(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (isCancelledStatus(currentStatus) && !isCancelledStatus(targetStatus)) return false;
  const bulkRule = ORDER_BULK_TARGET_SOURCE_STATUSES[targetStatus];
  if (bulkRule) return bulkRule.includes(currentStatus);
  if (targetStatus === ORDER_STATUS.cancelled) return !isCancelledStatus(currentStatus);
  return ORDER_STATUS_FLOW.includes(targetStatus);
}
