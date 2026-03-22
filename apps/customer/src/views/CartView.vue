<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <header class="sticky top-0 bg-white shadow z-50">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-600 hover:text-gray-900">
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
          <h1 class="text-xl font-bold ml-4">注文内容</h1>
        </div>

        <!-- Help Button -->
        <button
          @click="showHelp = true"
          class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-gray-500">店舗情報を読み込み中...</p>
      </div>

      <div v-else-if="!cartItems.length" class="text-center py-12">
        <p class="text-gray-600 mb-4">注文が空です</p>
        <router-link
          to="/"
          class="inline-block bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          メニューに戻る
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Order Summary Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold">注文内容</h2>
          </div>
          <div class="divide-y">
            <CartItem
              v-for="item in cartItems"
              :key="item.item.id + JSON.stringify(item.customizations)"
              :cartItem="item"
            />
          </div>
          <div class="p-4 border-t bg-gray-50">
            <div class="flex justify-between items-center text-xl font-bold">
              <span>合計金額</span>
              <span class="text-primary">¥{{ cartTotal }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Information Section -->
        <form @submit.prevent="submitOrder" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold">お客様情報</h2>
            </div>
            <div class="p-4 space-y-4">
              <!-- Name Fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >姓<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="orderForm.lastName"
                    type="text"
                    required
                    placeholder="山田"
                    :class="[
                      'w-full rounded-lg focus:ring-primary transition-colors',
                      validationErrors.lastName
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-primary',
                    ]"
                    @input="saveCustomerInfo"
                  />
                  <p v-if="validationErrors.lastName" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.lastName }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >名<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="orderForm.firstName"
                    type="text"
                    required
                    placeholder="太郎"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    @input="saveCustomerInfo"
                  />
                  <p v-if="validationErrors.firstName" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.firstName }}
                  </p>
                </div>
              </div>

              <!-- Address Fields -->
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >郵便番号<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="orderForm.postalCode"
                    type="text"
                    required
                    placeholder="100-0005"
                    pattern="^\d{3}-?\d{4}$"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    @input="saveCustomerInfo"
                  />
                  <p v-if="validationErrors.postalCode" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.postalCode }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >お届け先住所
                    <span class="text-xs font-normal text-gray-500">(お勤め先・配達先)</span
                    ><span class="text-red-500">*</span></label
                  >
                  <textarea
                    v-model="orderForm.addressLine"
                    required
                    rows="3"
                    placeholder="江戸川区南葛西5-13-10 ヤキベンビル 3F 会議室"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    @input="saveCustomerInfo"
                  ></textarea>
                  <p v-if="validationErrors.addressLine" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.addressLine }}
                  </p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >会社電話番号<span class="text-red-500">*</span></label
                >
                <input
                  v-model="orderForm.companyContact"
                  type="tel"
                  required
                  pattern="^[0-9]{10,11}$"
                  title="10桁または11桁の電話番号を入力してください"
                  placeholder="0312345678"
                  class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  @input="saveCustomerInfo"
                />
                <p v-if="validationErrors.companyContact" class="mt-1 text-sm text-red-500">
                  {{ validationErrors.companyContact }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >受け取り日<span class="text-red-500">*</span></label
                >
                <input
                  v-model="orderForm.deliveryDate"
                  type="date"
                  required
                  :min="minDate"
                  :max="maxDate"
                  class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  @change="onDateChange"
                />
                <p v-if="validationErrors.deliveryDate" class="mt-1 text-sm text-red-500">
                  {{ validationErrors.deliveryDate }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >受け取り時間<span class="text-red-500">*</span></label
                >
                <select
                  v-model="orderForm.deliveryTimeSlot"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  :disabled="!orderForm.deliveryDate || !availableTimeSlots.length"
                >
                  <option value="" disabled>時間を選択してください</option>
                  <option v-for="time in availableTimeSlots" :key="time" :value="time">
                    {{ time }}
                  </option>
                </select>
                <p v-if="validationErrors.deliveryTimeSlot" class="mt-1 text-sm text-red-500">
                  {{ validationErrors.deliveryTimeSlot }}
                </p>
                <p
                  v-if="orderForm.deliveryDate && !availableTimeSlots.length"
                  class="mt-1 text-sm text-red-500"
                >
                  選択された日は予約可能な時間がありません
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea
                  v-model="orderForm.notes"
                  rows="2"
                  placeholder="アレルギーなどの注意事項があればご記入ください"
                  class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Payment Method Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold">お支払い方法</h2>
            </div>
            <div class="p-4 space-y-3">
              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-primary bg-primary/5': orderForm.paymentMethod === 'cash' }"
              >
                <input
                  type="radio"
                  v-model="orderForm.paymentMethod"
                  value="cash"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span class="ml-3">現金</span>
              </label>

              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-primary bg-primary/5': orderForm.paymentMethod === 'paypay' }"
              >
                <input
                  type="radio"
                  v-model="orderForm.paymentMethod"
                  value="paypay"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <div class="ml-3">
                  <span class="font-bold text-[#0095EE]">PayPay</span>
                  <span class="text-sm text-gray-500 ml-2">(受け取り時に決済)</span>
                </div>
              </label>


            </div>
          </div>

          <!-- Submit Button -->
          <div class="space-y-3">
            <div v-if="!isAuthenticated" class="text-center p-4 bg-gray-100 rounded-xl mb-4">
              <p class="text-gray-600 mb-3">注文するにはログインが必要です</p>
            </div>

            <!-- Authenticated State -->
            <button
              v-else
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin mr-2">
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
              {{ isSubmitting ? '処理中...' : `注文を確定する (¥${cartTotal})` }}
            </button>

            <!-- Validation Summary -->
            <div v-if="hasValidationErrors" class="bg-red-50 border border-red-100 rounded-lg p-4">
              <h3 class="font-medium text-red-800 mb-2">以下の項目を確認してください：</h3>
              <ul class="text-sm text-red-600 space-y-1 list-disc list-inside">
                <li v-if="validationErrors.firstName || validationErrors.lastName">
                  お名前を正しく入力してください（漢字、ひらがな、カタカナ、アルファベットのみ）
                </li>
                <li v-if="validationErrors.postalCode">
                  郵便番号は半角数字7桁で入力してください（例：100-0005）
                </li>
                <li
                  v-if="
                    validationErrors.prefecture ||
                    validationErrors.city ||
                    validationErrors.addressLine
                  "
                >
                  住所を正しく入力してください（都道府県、市区町村、番地・建物名）
                </li>
                <li v-if="validationErrors.companyContact">
                  電話番号は半角数字10桁または11桁で入力してください（例：0312345678）
                </li>
                <li v-if="validationErrors.deliveryDate">
                  {{ validationErrors.deliveryDate }}
                </li>
                <li v-if="validationErrors.deliveryTimeSlot">
                  {{ validationErrors.deliveryTimeSlot }}
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </main>

    <!-- Help Modal -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showHelp = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold">お問い合わせ</h3>
          <button @click="showHelp = false" class="text-gray-500 hover:text-gray-700">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div v-if="restaurantInfo" class="space-y-4">
          <div>
            <h4 class="font-medium mb-2">ご注文について</h4>
            <ul class="space-y-2 text-sm">
              <li>ご注文は{{ restaurantInfo.hours.minAdvanceTime }}分前までにお願いいたします</li>
              <li>
                受け取り時間は{{ restaurantInfo.hours.open }}:00〜{{
                  restaurantInfo.hours.orderDeadline
                }}:00の間でご指定ください
              </li>
              <li>{{ restaurantInfo.hours.maxAdvanceDays }}営業日先までご予約可能です</li>
              <li>営業日: {{ businessDaysText }}</li>
              <li v-if="holidaysText">臨時休業: {{ holidaysText }}</li>
            </ul>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p>
              電話番号：<a :href="`tel:${restaurantInfo.phone}`" class="text-primary">{{
                restaurantInfo.phone
              }}</a>
            </p>
            <p>営業時間：{{ restaurantInfo.hours.open }}:00〜{{ restaurantInfo.hours.close }}:00</p>
            <p>
              LINE：<a
                :href="`https://line.me/R/ti/p/${restaurantInfo.sns.line}`"
                target="_blank"
                class="text-primary"
                >{{ restaurantInfo.sns.line }}
              </a>
            </p>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-400">読み込み中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import CartItem from '../components/CartItem.vue';
import { generateTrackingId } from '../data/menu';
import { STORAGE_KEYS } from '../constants';
import { ordersApi } from '../data/api/orders';
import { useCart } from '../stores/cart';
import { useRestaurantStore } from '../stores/restaurant';
import { supabase } from '@app/supabase';
import type { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../types';

const router = useRouter();
const { cartItems, cartTotal, clearCart } = useCart();
const { info: restaurantInfo, fetchInfo, isLoading } = useRestaurantStore();
const showHelp = ref(false);
const isSubmitting = ref(false); // Add loading state


onMounted(async () => {
  await fetchInfo(); // Ensure we have the latest settings
  await checkAuth();
});

const isAuthenticated = ref(false);

async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  isAuthenticated.value = !!session;

  // Also listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session;
    if (session) {
      // Re-fetch profile if user just logged in
      // We can extract the profile loading logic to a function and call it here
      loadProfileData();
    }
  });
}

async function loadProfileData() {
  // 1. Try to fetch from Supabase (Source of Truth for Profile)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        orderForm.value.firstName = profile.f_name || '';
        orderForm.value.lastName = profile.l_name || '';
        orderForm.value.companyContact = profile.tel || '';
        orderForm.value.postalCode = profile.postcode || '';
        orderForm.value.addressLine = profile.address || ''; // Direct map, no parsing needed
      }
    }
  } catch (e) {
    console.warn('Failed to load profile from Supabase, falling back to local:', e);
  }
}

// ... (interface remains same)

interface ValidationErrors {
  firstName: string;
  lastName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  companyContact: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
}

const orderForm = ref({
  firstName: '',
  lastName: '',
  postalCode: '',
  // prefecture: '', // Removed
  // city: '', // Removed
  addressLine: '', // Now serves as the full address excluding postal code
  companyContact: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
  notes: '',
  paymentMethod: 'cash' as PaymentMethod,
  needReceipt: false,
});

const validationErrors = ref<ValidationErrors>({
  firstName: '',
  lastName: '',
  postalCode: '',
  prefecture: '', // Keep type for now to avoid breaking interface locally, but won't use
  city: '',
  addressLine: '',
  companyContact: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
});

// Watch for form changes to trigger validation
watch(
  orderForm,
  () => {
    validateForm();
  },
  { deep: true }
);

// Load saved customer info and reorder pickup time from localStorage OR Supabase
onMounted(async () => {
  await checkAuth();
  if (isAuthenticated.value) {
    await loadProfileData();
  }

  // 2. Fallback / Override with LocalStorage
  if (!orderForm.value.firstName) {
    const savedInfo = localStorage.getItem(STORAGE_KEYS.CUSTOMER_INFO);
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      orderForm.value.firstName = info.firstName || '';
      orderForm.value.lastName = info.lastName || '';
      orderForm.value.postalCode = info.postalCode || '';
      // orderForm.value.prefecture = info.prefecture || '';
      // orderForm.value.city = info.city || '';
      orderForm.value.addressLine = info.addressLine || '';
      orderForm.value.companyContact = info.companyContact || '';
      orderForm.value.needReceipt = info.needReceipt || false;
    }
  }

  // ... (rest of onMounted)

  // Check for preserved pickup time from reorder
  const savedDeliveryTime = localStorage.getItem(STORAGE_KEYS.REORDER_PICKUP_TIME);
  if (savedDeliveryTime) {
    const deliveryTime = new Date(savedDeliveryTime);
    // Final validation before using the preserved time
    // We can just rely on the form validation or basic date check
    const min = new Date(minDate.value);
    const max = new Date(maxDate.value);
    const dDate = new Date(deliveryTime);
    dDate.setHours(0, 0, 0, 0); // compare dates only

    if (dDate >= min && dDate <= max) {
      orderForm.value.deliveryDate = deliveryTime.toISOString().slice(0, 10);
      const hours = deliveryTime.getHours().toString().padStart(2, '0');
      const mins = deliveryTime.getMinutes().toString().padStart(2, '0');
      // We might want to check if this slot is in availableTimeSlots,
      // but availableTimeSlots depends on deliveryDate being set.
      // Since the watcher is deep, setting deliveryDate triggers validateForm?
      // But availableTimeSlots is computed.
      // Let's set it, and let the UI validate it.
      orderForm.value.deliveryTimeSlot = `${hours}:${mins}`;
    }
    // Remove the saved pickup time
    localStorage.removeItem(STORAGE_KEYS.REORDER_PICKUP_TIME);
  }

  validateForm();
});

// Save customer info to localStorage
function saveCustomerInfo() {
  localStorage.setItem(
    STORAGE_KEYS.CUSTOMER_INFO,
    JSON.stringify({
      firstName: orderForm.value.firstName,
      lastName: orderForm.value.lastName,
      postalCode: orderForm.value.postalCode,
      // prefecture: orderForm.value.prefecture,
      // city: orderForm.value.city,
      addressLine: orderForm.value.addressLine,
      companyContact: orderForm.value.companyContact,
      needReceipt: orderForm.value.needReceipt,
    })
  );
  validateForm();
}

// Helper to format Date to 'YYYY-MM-DDTHH:mm' in Local Time
function toLocalISOString(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const isDateValid = (d: Date) => {
  const dayOfWeek = d.getDay();
  const dateStr = d.toLocaleDateString('sv-SE'); // Consistent YYYY-MM-DD
  const hours = restaurantInfo.value?.hours;
  if (!hours) return false;

  // 1. Holiday check (Highest priority - Closed)
  if (hours.holidays && hours.holidays.includes(dateStr)) return false;

  // 2. Special Open Day check (Override business days)
  if (hours.specialDays && hours.specialDays.includes(dateStr)) return true;

  // 3. Normal Business Day check
  if (!hours.businessDays.includes(dayOfWeek)) return false;

  return true;
};

const minDeliveryTime = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + (restaurantInfo.value?.hours.minAdvanceTime || 30));

  // If after closing time (or order deadline), set to next business day
  const closingHour = restaurantInfo.value?.hours.orderDeadline || 20;

  if (now.getHours() >= closingHour) {
    do {
      now.setDate(now.getDate() + 1);
    } while (!isDateValid(now));
    now.setHours(restaurantInfo.value?.hours.open || 10, 0, 0, 0);
  } else if (now.getHours() < (restaurantInfo.value?.hours.open || 10)) {
    // If before opening time, set to today's open time
    now.setHours(restaurantInfo.value?.hours.open || 10, 0, 0, 0);
  }

  // If current day is not a business day, find next business day
  let safetyCounter = 0;
  while (!isDateValid(now) && safetyCounter < 365) {
    now.setDate(now.getDate() + 1);
    now.setHours(restaurantInfo.value?.hours.open || 10, 0, 0, 0);
    safetyCounter++;
  }

  return toLocalISOString(now);
});

const maxDeliveryTime = computed(() => {
  const max = new Date();
  let daysChecked = 0;
  let validDaysFound = 0;

  while (validDaysFound < (restaurantInfo.value?.hours.maxAdvanceDays || 30) && daysChecked < 90) {
    if (isDateValid(max)) {
      validDaysFound++;
    }
    if (validDaysFound < (restaurantInfo.value?.hours.maxAdvanceDays || 30)) {
      max.setDate(max.getDate() + 1);
    }
    daysChecked++;
  }

  max.setHours(restaurantInfo.value?.hours.orderDeadline || 20, 0, 0, 0);
  return toLocalISOString(max);
});

// Return YYYY-MM-DD for min attribute of date input
const minDate = computed(() => {
  if (!minDeliveryTime.value) return '';
  return minDeliveryTime.value.split('T')[0];
});

// Return YYYY-MM-DD for max attribute of date input
const maxDate = computed(() => {
  if (!maxDeliveryTime.value) return '';
  return maxDeliveryTime.value.split('T')[0];
});

// Generate available time slots based on selected date
const availableTimeSlots = computed(() => {
  if (!orderForm.value.deliveryDate || !restaurantInfo.value?.hours) return [];

  const slots: string[] = [];

  // Safe Local Date Construction
  const [y, m, d] = orderForm.value.deliveryDate.split('-').map(Number);
  const selectedDate = new Date(y, m - 1, d); // Local Midnight
  const now = new Date(); // Local Now

  const startHour = restaurantInfo.value.hours.open || 10;
  const endHour = restaurantInfo.value.hours.orderDeadline || 20;

  // Logic: Iterate from startHour to endHour in 30 min increments
  let current = new Date(selectedDate);
  current.setHours(startHour, 0, 0, 0);

  const end = new Date(selectedDate);
  end.setHours(endHour, 0, 0, 0);

  // Check min advance time if selected date is today
  const minTime = new Date();
  minTime.setMinutes(minTime.getMinutes() + (restaurantInfo.value.hours.minAdvanceTime || 30));

  while (current <= end) {
    // If selected date is today, filter out past times
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    if (isToday) {
      if (current >= minTime) {
        slots.push(toLocalISOString(current).slice(11, 16));
      }
    } else {
      // Future date, all slots valid
      slots.push(toLocalISOString(current).slice(11, 16));
    }
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
});

// Reset time slot when date changes
const onDateChange = () => {
  orderForm.value.deliveryTimeSlot = '';
  validateForm();
};

const hasValidationErrors = computed(() => {
  return Object.values(validationErrors.value).some((error) => error !== '');
});

const isFormValid = computed(() => {
  const hasRequiredFields =
    orderForm.value.firstName &&
    orderForm.value.lastName &&
    orderForm.value.postalCode &&
    orderForm.value.addressLine && // Single field
    orderForm.value.companyContact &&
    orderForm.value.deliveryDate &&
    orderForm.value.deliveryTimeSlot &&
    orderForm.value.paymentMethod &&
    cartItems.value.length > 0;

  return hasRequiredFields && !hasValidationErrors.value;
});

const businessDaysText = computed(() => {
  if (!restaurantInfo.value?.hours.businessDays) return '';
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return restaurantInfo.value.hours.businessDays
    .slice()
    .sort((a, b) => a - b)
    .map((d) => days[d])
    .join('・');
});

const holidaysText = computed(() => {
  if (!restaurantInfo.value?.hours.holidays?.length) return '';
  return restaurantInfo.value.hours.holidays.join(', ');
});

function validateForm() {
  validationErrors.value = {
    firstName: '',
    lastName: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine: '',
    companyContact: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
  };

  // Name validation (allow Japanese or English)
  const namePattern = /^[A-Za-zぁ-んァ-ン一-龥々]+$/;
  if (!orderForm.value.firstName) {
    validationErrors.value.firstName = '名前を入力してください';
  } else if (!namePattern.test(orderForm.value.firstName)) {
    validationErrors.value.firstName = '有効な名前を入力してください';
  }

  if (!orderForm.value.lastName) {
    validationErrors.value.lastName = '姓を入力してください';
  } else if (!namePattern.test(orderForm.value.lastName)) {
    validationErrors.value.lastName = '有効な姓を入力してください';
  }

  // Postal code validation
  const postalPattern = /^\d{3}-?\d{4}$/;
  if (!orderForm.value.postalCode) {
    validationErrors.value.postalCode = '郵便番号を入力してください';
  } else if (!postalPattern.test(orderForm.value.postalCode)) {
    validationErrors.value.postalCode = '正しい郵便番号を入力してください（例：100-0005）';
  }

  // Address line validation (Single field now)
  if (!orderForm.value.addressLine) {
    validationErrors.value.addressLine = '住所を入力してください';
  }

  // Phone validation
  const phonePattern = /^[0-9]{10,11}$/;
  if (!orderForm.value.companyContact) {
    validationErrors.value.companyContact = '電話番号を入力してください';
  } else if (!phonePattern.test(orderForm.value.companyContact)) {
    validationErrors.value.companyContact = '有効な電話番号を入力してください（10桁または11桁）';
  }

  // Date/Time validation
  if (!orderForm.value.deliveryDate) {
    validationErrors.value.deliveryDate = '受け取り日を選択してください';
  } else {
    const dateStr = orderForm.value.deliveryDate;
    const hours = restaurantInfo.value?.hours;

    if (hours) {
      if (hours.holidays && hours.holidays.includes(dateStr)) {
        validationErrors.value.deliveryDate = '選択された日は臨時休業日です';
      } else if (hours.specialDays && hours.specialDays.includes(dateStr)) {
        // Special working day, skip business day check
      } else {
        // Construct date in local time to check day of week correctly
        const [y, m, d] = dateStr.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);

        if (!hours.businessDays.includes(localDate.getDay())) {
          validationErrors.value.deliveryDate = '選択された日は定休日です';
        }
      }
    }
  }

  if (orderForm.value.deliveryDate && !orderForm.value.deliveryTimeSlot) {
    validationErrors.value.deliveryTimeSlot = '受け取り時間を選択してください';
  }
}

async function submitOrder() {
  validateForm();
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const trackingId = generateTrackingId();
    // const fullAddress = ... (removed unused variable)

    // Construct the payload to match what the Edge Function expects
    const deliveryDateTime = `${orderForm.value.deliveryDate}T${orderForm.value.deliveryTimeSlot}:00`;

    const orderData: Partial<Order> = {
      trackingId,
      items: cartItems.value.map((item) => ({
        item: {
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
        },
        quantity: item.quantity,
        subtotal: item.subtotal,
        customizations: item.customizations || [],
      })) as any, // Cast to any to avoid strict MenuItem type check for payload
      customer: {
        name: `${orderForm.value.lastName} ${orderForm.value.firstName}`,
        phone: orderForm.value.companyContact,
        company: '',
        postalCode: orderForm.value.postalCode, // Send explicitly
        address: orderForm.value.addressLine, // Send as simple string without ZIP
      } as any,
      // Flat properties for the Edge Function mapper
      deliveryTime: new Date(deliveryDateTime).toISOString(),
      notes: orderForm.value.notes,
      status: 'pending' as OrderStatus,
      paymentMethod: orderForm.value.paymentMethod,
      paymentStatus:
        orderForm.value.paymentMethod === 'paypay' ? 'pending' : ('completed' as PaymentStatus),
      total: cartTotal.value,
      // Add other fields if needed by Edge Function logic directly
    } as any;

    // Save order
    const result = await ordersApi.createOrder(orderData);

    // Clear cart
    clearCart();

    // Use the tracking ID returned by the server (in case it was re-generated or normalized)
    const finalTrackingId = result.trackingId || orderData.trackingId;

    // Save the current order ID to ensure it's available immediately
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORDER, finalTrackingId);

    // Redirect to order history page instead of detail
    await router.push({ name: 'history' });

    // Optional: Show a toast/success message before redirecting?
    // For now, history view is sufficient confirmation.
  } catch (error) {
    console.error('Order submission failed:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
