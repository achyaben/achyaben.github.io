export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  customizations?: Customization[]; // Keep for backward compatibility if needed, or deprecate
  customizationGroups?: CustomizationGroup[];
  available: boolean;
  quantity?: number; // UI state for menu list
  sort_order?: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  min_selection: number; // calculated from is_required
  max_selection: number;
  options: Customization[];
  sort_order?: number;
}

export interface Customization {
  id: string;
  name: string;
  price: number;
  available: boolean;
  is_default?: boolean;
  sort_order?: number;
  group_sort_order?: number;
  group_required?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  customizations: string[];
  subtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'completed';
export type PaymentMethod = 'cash' | 'card' | 'paypay';

export interface Order {
  id: string;
  trackingId: string;
  items: CartItem[];
  customer: {
    name: string;
    phone: string;
    company?: string;
    postalCode?: string; // Add explicit postalCode
    address:
      | string
      | {
          street: string;
          city: string;
          postalCode: string;
          prefecture?: string;
          instructions?: string;
        };
  };
  deliveryTime?: string;
  order_type?: 'pickup' | 'delivery';
  notes?: string;
  needReceipt?: boolean;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}
