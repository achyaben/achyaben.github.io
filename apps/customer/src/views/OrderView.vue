<template>
  <div class="min-h-screen bg-gray-50">
    <div>
      <header class="sticky top-0 bg-white shadow z-50 print:hidden">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/history" class="text-gray-600 hover:text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </router-link>
            <h1 class="text-xl font-bold ml-4">{{ UI_TEXT.order.detail.title }}</h1>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="order"
              @click="printOrder"
              class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="印刷"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
            <button
              v-if="order?.needReceipt"
              @click="printReceipt"
              class="p-2 text-primary hover:text-primary-dark transition-colors"
              title="領収書を印刷"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <main v-if="isLoading" class="container mx-auto px-4 py-12 text-center">
        <div class="inline-block animate-spin mr-2">
          <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600 mt-4">{{ UI_TEXT.common.loading }}</p>
      </main>

      <!-- Not Found -->
      <main v-else-if="!order" class="container mx-auto px-4 py-12">
        <div class="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto text-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 class="text-lg font-bold text-gray-900">{{ UI_TEXT.order.detail.notFound.title }}</h2>
          <p class="text-gray-600">{{ UI_TEXT.order.detail.notFound.message }}</p>
          <div class="pt-4">
            <router-link
              to="/history"
              class="inline-block bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors"
            >
              {{ UI_TEXT.order.detail.notFound.action }}
            </router-link>
          </div>
        </div>
      </main>

      <!-- Order Content -->
      <main v-else class="container mx-auto px-4 py-6 space-y-6">
        <!-- Order Status -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 flex justify-between items-center border-b">
            <div class="flex items-center gap-3">
              <div>
                <span class="text-sm text-gray-500">{{ UI_TEXT.order.detail.orderNumber }}</span>
                <div class="font-medium">{{ order.trackingId }}</div>
              </div>
              <span
                v-if="order.order_type"
                :class="
                  order.order_type === 'pickup'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                "
                class="text-xs px-2 py-1 rounded-full font-bold uppercase mt-4"
              >
                {{ order.order_type === 'pickup' ? '店頭受取' : 'お届け' }}
              </span>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
              <div class="flex items-center gap-2">
                <span
                  v-if="order.status !== 'cancelled'"
                  :class="{
                    'text-green-600': order.status === 'completed',
                    'text-blue-600': order.status === 'delivering',
                    'text-orange-500': order.status === 'preparing',
                    'text-yellow-600': order.status === 'pending',
                  }"
                  class="font-medium"
                >
                  {{ (UI_TEXT.order.status as any)[order.status] || order.status }}
                </span>
                <button
                  v-if="canCancel"
                  @click="showCancelConfirm = true"
                  :disabled="isCancelling"
                  class="text-xs px-2 py-0.5 rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors font-bold disabled:opacity-40"
                >
                  ✕ キャンセル
                </button>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Order Progress -->
          <div class="px-4 py-3 bg-gray-50">
            <div class="flex items-center space-x-2">
              <span
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-green-500': order.status === 'completed',
                  'bg-blue-500 animate-pulse': order.status === 'delivering',
                  'bg-orange-500 animate-pulse': order.status === 'preparing',
                  'bg-yellow-500 animate-pulse': order.status === 'pending',
                  'bg-red-500': order.status === 'cancelled',
                }"
              ></span>
              <span
                class="text-sm font-medium"
                :class="{
                  'text-green-800': order.status === 'completed',
                  'text-blue-800': order.status === 'delivering',
                  'text-orange-800': order.status === 'preparing',
                  'text-yellow-800': order.status === 'pending',
                  'text-red-800': order.status === 'cancelled',
                }"
              >
                {{ (UI_TEXT.order.status as any)[order.status] || order.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Cancel Reason Notice -->
        <div
          v-if="order.status === 'cancelled' && order.cancel_reason"
          class="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p class="text-xs font-black text-red-500 uppercase tracking-widest mb-1">
            キャンセル理由
          </p>
          <p class="text-sm text-red-700">{{ order.cancel_reason }}</p>
        </div>

        <!-- Order Details -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="font-bold">注文内容</h2>
          </div>
          <div class="divide-y">
            <div
              v-for="item in order.items"
              :key="item.item.id"
              class="p-4 flex justify-between items-center"
            >
              <div class="flex items-center space-x-3">
                <img
                  :src="getImageUrl(getMenuItem(item.item.id)?.image || '')"
                  :alt="item.item.name"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <div class="font-medium">{{ item.item.name }}</div>
                  <div class="text-sm text-gray-600">{{ item.quantity }}個</div>
                  <div v-if="item.customizations?.length" class="text-sm text-gray-500">
                    {{ getCustomizationNames(item.item.id, item.customizations) }}
                  </div>
                </div>
              </div>
              <div class="font-medium">¥{{ item.subtotal }}</div>
            </div>
          </div>
          <div class="p-4 border-t bg-gray-50">
            <div class="flex justify-between items-center text-lg font-bold">
              <span>合計</span>
              <span class="text-primary">¥{{ order.total }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <!-- Customer Info (Hidden as per request) -->
        <!-- <div class="bg-white rounded-lg shadow-sm overflow-hidden">
             ... (Customer info hidden)
        </div> -->

        <!-- Payment Info -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-4 border-b">
            <h2 class="font-bold">{{ UI_TEXT.order.detail.paymentInfo }}</h2>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <div class="text-sm text-gray-500">{{ UI_TEXT.order.detail.paymentMethod }}</div>
              <div class="flex items-center">
                <span v-if="order.paymentMethod === 'paypay'" class="font-bold text-[#0095EE]">{{
                  UI_TEXT.cart.payment.paypay
                }}</span>
                <span v-else>{{ UI_TEXT.cart.payment.cash }}</span>
                <span class="text-sm text-gray-500 ml-2"
                  >({{
                    order.paymentStatus === 'completed'
                      ? UI_TEXT.cart.payment.completed
                      : UI_TEXT.cart.payment.pending
                  }})</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            @click="reorder"
            :disabled="isReordering"
            class="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
          >
            <span v-if="isReordering" class="inline-block animate-spin mr-2">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span>{{
              isReordering
                ? UI_TEXT.order.detail.action.reordering
                : UI_TEXT.order.detail.action.reorder
            }}</span>
          </button>
        </div>
        <!-- Cancel: must call (<60 min window) -->
        <div v-if="callRequired" class="text-center text-sm text-gray-600 py-1">
          キャンセルはお電話にて承ります
          <a
            v-if="restaurantInfo?.phone"
            :href="`tel:${restaurantInfo.phone}`"
            class="ml-1 text-primary font-bold underline"
            >{{ restaurantInfo.phone }}</a
          >
        </div>
      </main>

      <!-- Cancel Confirm Modal -->
      <div
        v-if="showCancelConfirm"
        class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0"
        @click.self="showCancelConfirm = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-900">注文をキャンセルしますか？</h3>
          <p class="text-sm text-gray-600">キャンセルは取り消せません。</p>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">
              キャンセル理由 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="例: 都合が悪くなりました..."
              class="w-full rounded-lg border-gray-300 text-sm focus:border-red-400 focus:ring-red-400 resize-none"
            />
          </div>
          <div class="flex gap-3 pt-1">
            <button
              @click="showCancelConfirm = false"
              class="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
            <button
              @click="confirmCancel"
              :disabled="!cancelReason.trim()"
              class="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              キャンセルする
            </button>
          </div>
        </div>
      </div>

      <!-- Print Layout -->
      <div v-if="order" class="hidden print:block p-8">
        <div v-if="restaurantInfo" class="text-center mb-8 border-b pb-4">
          <h1 class="text-2xl font-bold mb-2">{{ restaurantInfo.name }}</h1>
          <p class="text-sm">
            〒{{ restaurantInfo.address.postal }} {{ restaurantInfo.address.prefecture
            }}{{ restaurantInfo.address.city }}{{ restaurantInfo.address.line1 }}
          </p>
          <p class="text-sm">Tel: {{ restaurantInfo.phone }}</p>
        </div>

        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4 text-center border-b pb-2">
            {{
              order.needReceipt
                ? UI_TEXT.order.detail.print.receiptTitle
                : UI_TEXT.order.detail.print.orderTitle
            }}
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-sm text-gray-600">{{ UI_TEXT.order.detail.print.customerName }}</p>
              <p class="font-medium">{{ order.customer.name }} 様</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ UI_TEXT.order.detail.orderNumber }}</p>
              <p class="font-medium">{{ order.trackingId }}</p>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-gray-600">{{ UI_TEXT.order.detail.print.deliveryAddress }}</p>
            <p class="font-medium">
              {{ formatAddress(order.customer.address) }}
            </p>
            <p class="font-medium">TEL: {{ order.customer.phone }}</p>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div>
              <p class="text-sm text-gray-600">{{ UI_TEXT.order.detail.print.orderDate }}</p>
              <p class="font-medium">{{ formatDateForPrint(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ UI_TEXT.order.detail.deliveryTime }}</p>
              <p class="font-medium">
                {{ order.deliveryTime ? formatDateForPrint(order.deliveryTime) : '' }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="font-bold mb-2">注文内容</h3>
          <table class="w-full mb-4">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2">{{ UI_TEXT.order.detail.print.itemName }}</th>
                <th class="text-center py-2">{{ UI_TEXT.order.detail.print.quantity }}</th>
                <th class="text-right py-2">{{ UI_TEXT.order.detail.print.amount }}</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="item in order?.items" :key="item.item.id">
                <td class="py-2">
                  {{ item.item.name }}
                  <div v-if="item.customizations?.length" class="text-sm text-gray-600">
                    {{ getCustomizationNames(item.item.id, item.customizations) }}
                  </div>
                </td>
                <td class="text-center py-2">{{ item.quantity }}</td>
                <td class="text-right py-2">¥{{ item.subtotal }}</td>
              </tr>
            </tbody>
            <tfoot class="border-t">
              <tr>
                <td colspan="2" class="py-2 font-bold">合計</td>
                <td class="text-right py-2 font-bold">¥{{ order?.total }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="text-sm text-gray-600 mt-8 text-center">
          <p>{{ UI_TEXT.order.detail.print.thanks }}</p>
          <p>{{ UI_TEXT.order.detail.print.seeYouAgain }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { STORAGE_KEYS } from '../constants';
import { useRestaurantStore } from '../stores/restaurant';
import { menuItems, fetchMenu } from '../data/menu';

const { info: restaurantInfo } = useRestaurantStore();
import { UI_TEXT } from '../constants/ui-text';
import type { Order } from '../types';
import { useCart } from '../stores/cart';
import { ordersApi } from '../data/api/orders';

const route = useRoute();
const router = useRouter();
const { clearCart } = useCart();

const order = ref<Order | null>(null);
const isReordering = ref(false);
const isLoading = ref(true);
const showCancelConfirm = ref(false);
const isCancelling = ref(false);
const cancelReason = ref('');

// Can self-cancel: pending/accepted and delivery > 60 min away
const canCancel = computed(() => {
  if (!order.value) return false;
  const s = order.value.status;
  if (s !== 'pending' && s !== 'accepted') return false;
  if (!order.value.deliveryTime) return false;
  return new Date(order.value.deliveryTime).getTime() > Date.now() + 60 * 60 * 1000;
});

// Within 60 min window: must call to cancel
const callRequired = computed(() => {
  if (!order.value) return false;
  const s = order.value.status;
  if (s !== 'pending' && s !== 'accepted') return false;
  if (!order.value.deliveryTime) return false;
  const dt = new Date(order.value.deliveryTime).getTime();
  return dt <= Date.now() + 60 * 60 * 1000 && dt > Date.now();
});

import { getImageUrl } from '../utils/image';
import { formatDate, formatDateLong } from '../utils/date';

// Helper to look up full menu item (including image)
function getMenuItem(id: string) {
  return menuItems.value.find((i) => i.id === id);
}

// Helper for formatting address
function formatAddress(address: any) {
  if (!address) return '住所情報なし';
  if (typeof address === 'string') return address;

  // Handle object format
  const { postalCode, prefecture, city, street, building } = address as any;
  return [postalCode ? `〒${postalCode}` : '', prefecture, city, street, building]
    .filter(Boolean)
    .join(' ');
}

async function loadOrder() {
  isLoading.value = true;
  try {
    const trackingId = route.params.trackingId;

    if (!trackingId) {
      order.value = null;
      return;
    }

    // Check for current order first
    const currentOrderId = localStorage.getItem(STORAGE_KEYS.CURRENT_ORDER);
    if (currentOrderId === trackingId) {
      // Clear it so we don't use it again
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ORDER);
    }

    // Load order from API
    // Ensure trackingId is a string
    const id = Array.isArray(trackingId) ? trackingId[0] : trackingId;
    const result = await ordersApi.getOrderByTrackingId(id);
    order.value = result;
  } catch (error) {
    console.error('Failed to load order:', error);
    order.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Initialize and handle route changes
onMounted(async () => {
  if (menuItems.value.length === 0) {
    await fetchMenu();
  }
  loadOrder();
});

const getCustomizationNames = (itemId: string, customizationIds: string[]) => {
  if (!customizationIds || !customizationIds.length) return '';
  const item = menuItems.value.find((i) => i.id === itemId);
  if (!item || !item.customizations) return '';

  const counts: Record<string, number> = {};
  customizationIds.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([id, quantity]) => {
      const option = item.customizations?.find((c) => c.id === id);
      return { id, quantity, option };
    })
    .sort((a, b) => {
      // 1. Group Sort Order
      const aGSO = a.option?.group_sort_order || 0;
      const bGSO = b.option?.group_sort_order || 0;
      if (aGSO !== bGSO) return aGSO - bGSO;

      // 2. Group Required (Tie-breaker for group)
      const aGR = a.option?.group_required ? -1 : 1;
      const bGR = b.option?.group_required ? -1 : 1;
      if (aGR !== bGR) return aGR - bGR;

      // 3. Option Sort Order (Tie-breaker within group)
      if ((a.option?.sort_order || 0) !== (b.option?.sort_order || 0)) {
        return (a.option?.sort_order || 0) - (b.option?.sort_order || 0);
      }

      // 4. Name (Final stability)
      return (a.option?.name || '').localeCompare(b.option?.name || '');
    })
    .map(({ quantity, option }) => {
      if (!option) return null;
      let text = quantity > 1 ? `${option.name} ×${quantity}` : option.name;
      const price = option.price || 0;
      if (price > 0) {
        text += ` (+¥${price * quantity})`;
      }
      return text;
    })
    .filter(Boolean)
    .join('、');
};

// Watch for route changes after initial mount
watch(
  () => route.params.trackingId,
  (_newId) => {
    loadOrder();
  }
);

async function reorder() {
  if (isReordering.value || !order.value) return;

  isReordering.value = true;

  try {
    // Clear current cart
    clearCart();

    // Add all items from the old order
    const { addToCart } = useCart();

    order.value.items.forEach((orderItem) => {
      // Robust handling: Check if it's nested (formatted) or flat (legacy/raw)
      const itemData: any = orderItem.item ? orderItem.item : orderItem;
      const quantity = orderItem.quantity || 1;
      const customizations = orderItem.customizations || [];

      // Find the current menu item to get updated prices
      const fullItem = menuItems.value.find((i) => i.id === itemData.id);

      if (fullItem && fullItem.available) {
        // Automatically fetches the current price and calculates the correct subtotal!
        addToCart(fullItem, customizations, quantity);
      }
    });

    // Extract customer name parts
    const [lastName = '', firstName = ''] = (order.value.customer.name || '').split(' ');

    // Address is now an object
    const addressInfo = order.value.customer.address;
    const isAddressObject = typeof addressInfo === 'object' && addressInfo !== null;

    // Construct customer info object safely
    const customerInfo = {
      lastName,
      firstName,
      companyName: '',
      postalCode: isAddressObject ? (addressInfo as any).postalCode || '' : '',
      prefecture: isAddressObject ? (addressInfo as any).prefecture || '' : '',
      city: isAddressObject ? (addressInfo as any).city || '' : '',
      addressLine: isAddressObject
        ? (addressInfo as any).street || ''
        : typeof addressInfo === 'string'
          ? addressInfo
          : '',
      companyContact:
        typeof order.value.customer.phone === 'string' ? order.value.customer.phone : '',
      needReceipt: !!order.value.needReceipt,
      notes: order.value.notes || '',
      paymentMethod: order.value.paymentMethod || 'cash',
    };

    // Save customer info ONLY if we have valid data (e.g. at least postal code)
    if (customerInfo.postalCode) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_INFO, JSON.stringify(customerInfo));
    }

    // Preserve order type (pickup vs delivery) for the cart
    if (order.value.order_type) {
      localStorage.setItem(STORAGE_KEYS.REORDER_ORDER_TYPE, order.value.order_type);
    }

    // Redirect to cart so user can select NEW date/time
    await router.push('/cart');
  } catch (error) {
    console.error('Reorder failed:', error);
  } finally {
    isReordering.value = false;
  }
}

async function confirmCancel() {
  if (!order.value || isCancelling.value || !cancelReason.value.trim()) return;
  isCancelling.value = true;
  showCancelConfirm.value = false;
  try {
    const success = await ordersApi.cancelOrder(order.value.id, cancelReason.value.trim());
    if (success) {
      order.value = { ...order.value, status: 'cancelled' };
    } else {
      alert('キャンセルに失敗しました。もう一度お試しください。');
    }
  } catch (e) {
    console.error(e);
    alert('キャンセルに失敗しました。もう一度お試しください。');
  } finally {
    isCancelling.value = false;
    cancelReason.value = '';
  }
}

// Add print functions
function printOrder() {
  window.print();
}

function printReceipt() {
  window.print();
}

// Add date format for printing
const formatDateForPrint = formatDateLong;

// Add print styles
const style = document.createElement('style');
style.textContent = `
@media print {
  @page {
    size: A4;
    margin: 1cm;
  }
  html {
    background-color: white !important;
  }
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    background-color: white !important;
  }
  .print\\:block {
    display: block !important;
  }
  .print\\:hidden {
    display: none !important;
  }
  /* Ensure proper borders in print */
  .border, .border-t, .border-b {
    border-color: #000 !important;
    border-width: 1px !important;
  }
  .divide-y > * + * {
    border-top: 1px solid #000 !important;
  }
  /* Ensure text colors are visible */
  .text-gray-500, .text-gray-600 {
    color: #444 !important;
  }
  .text-primary {
    color: #000 !important;
  }
  /* Force background colors */
  .bg-white, .bg-gray-50 {
    background-color: white !important;
  }
  /* Table styles */
  table {
    border-collapse: collapse;
  }
  th, td {
    border-bottom: 1px solid #000 !important;
  }
  thead {
    display: table-header-group;
  }
  tfoot {
    display: table-footer-group;
  }
  /* Ensure proper spacing */
  .container {
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}
`;
document.head.appendChild(style);
</script>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 1cm;
  }

  /* Additional print-specific styles */
  :root {
    color-scheme: light !important;
  }

  * {
    box-shadow: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
