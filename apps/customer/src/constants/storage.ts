export const STORAGE_KEYS = {
  CART_ITEMS: 'app_cart_items',
  CUSTOMER_INFO: 'app_customer_info',
  ORDERS: 'app_orders',
  REORDER_PICKUP_TIME: 'app_reorder_pickup_time',
  CURRENT_ORDER: 'app_current_order',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
