import { ref, computed } from 'vue';
import type { MenuItem } from '../types';

interface CartItem {
  item: MenuItem;
  quantity: number;
  customizations: string[];
  subtotal: number;
}

const STORAGE_KEY = 'app-cart';

// Load initial cart state from localStorage
const initialCart = localStorage.getItem(STORAGE_KEY);
const cartItems = ref<CartItem[]>(initialCart ? JSON.parse(initialCart) : []);

function calculateSubtotal(
  item: MenuItem,
  quantity: number,
  customizations: string[] = []
): number {
  let subtotal = item.price * quantity;
  if (item.customizations) {
    customizations.forEach((customId) => {
      const customization = item.customizations?.find((c) => c.id === customId);
      if (customization?.price) {
        subtotal += customization.price * quantity;
      }
    });
  }
  return subtotal;
}

// Save cart to localStorage whenever it changes
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems.value));
}

// Computed properties
const cartItemCount = computed(() =>
  cartItems.value.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
);

const cartTotal = computed(() =>
  cartItems.value.reduce((sum: number, item: CartItem) => sum + item.subtotal, 0)
);

// Cart operations
function addToCart(item: MenuItem, customizations: string[] = [], quantity: number = 1) {
  const existingItem = cartItems.value.find(
    (i: CartItem) =>
      i.item.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = calculateSubtotal(item, existingItem.quantity, customizations);
  } else {
    const subtotal = calculateSubtotal(item, quantity, customizations);
    cartItems.value.push({
      item,
      quantity,
      customizations: customizations || [],
      subtotal,
    });
  }
  saveCart();
}

function removeFromCart(itemId: string, customizations: string[] = []) {
  const index = cartItems.value.findIndex(
    (i: CartItem) =>
      i.item.id === itemId && JSON.stringify(i.customizations) === JSON.stringify(customizations)
  );

  if (index !== -1) {
    cartItems.value.splice(index, 1);
    saveCart();
  }
}

function updateQuantity(itemId: string, quantity: number, customizations: string[] = []) {
  const item = cartItems.value.find(
    (i: CartItem) =>
      i.item.id === itemId && JSON.stringify(i.customizations) === JSON.stringify(customizations)
  );

  if (item) {
    if (quantity <= 0) {
      removeFromCart(itemId, customizations);
    } else {
      item.quantity = quantity;
      item.subtotal = calculateSubtotal(item.item, quantity, customizations);
      saveCart();
    }
  }
}

function getItemQuantity(itemId: string, customizations: string[] = []): number {
  const item = cartItems.value.find(
    (i: CartItem) =>
      i.item.id === itemId && JSON.stringify(i.customizations) === JSON.stringify(customizations)
  );
  return item?.quantity || 0;
}

function clearCart() {
  cartItems.value = [];
  saveCart();
}

// Export store
export const useCart = () => ({
  cartItems,
  cartItemCount,
  cartTotal,
  addToCart,
  removeFromCart,
  updateQuantity,
  getItemQuantity,
  clearCart,
  saveCart,
});
