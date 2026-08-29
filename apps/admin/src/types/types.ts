import type { UserRole } from '../constants/auth';
export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar_url?: string;
  role: UserRole;
  deleted_at?: string | null;
}

export interface Order {
  id: string;
  trackingId: string;
  customer: {
    name: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      instructions?: string;
    };
    company?: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'paypay';
  paymentStatus: 'pending' | 'completed';
  deliveryTime?: string;
  orderType?: 'pickup' | 'delivery';
  createdAt: string;
  updatedAt: string;
  comments?: string; // mapped from notes in DB
  // notes?: string; // not used directly, use comments
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  driver?: User;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  options?: OrderItemOption[];
}

export interface OrderItemOption {
  name: string;
  choice: string;
  price?: number;
  sort_order?: number;
  group_sort_order?: number;
  group_required?: boolean;
}

export interface Customization {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  outOfStock?: boolean;
  sort_order?: number;
  groups?: any[]; // Using any for now to avoid deep type nesting
}

export interface RestaurantSettings {
  name: string;
  address: {
    postal: string;
    prefecture: string;
    city: string;
    line1: string;
  };
  phone: string;
  email: string;
  hours: {
    open: number;
    close: number;
    orderDeadline: number;
    minAdvanceTime: number;
    maxAdvanceDays: number;
    businessDays: number[];
  };
  delivery_hours?: {
    start: string;
    end: string;
  };
  delivery_disabled_dates?: string[];
  support: {
    phone: string;
    hours: string;
    email: string;
  };
}

export interface Banner {
  id: number;
  text: string;
  url?: string; // Optional redirect URL
  startDate: string;
  endDate: string;
}

export interface OrderSummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  cash: number;
  card: number;
  paypay: number;
}
