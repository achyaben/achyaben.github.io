<template>
  <div class="px-4">
    <!-- Tabs -->
    <div class="tabs flex space-x-4 border-b border-gray-300 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="{
          'text-blue-500 border-blue-500': activeTab === tab,
          'text-gray-500 hover:text-blue-500': activeTab !== tab,
        }"
        class="px-4 py-2 border-b-2 font-medium text-sm"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Current Delivery Tab -->
    <div v-if="activeTab === UI_TEXTS.delivery.tabs.current">
      <div v-if="currentDelivery" class="p-4 bg-white shadow-lg rounded-md">
        <!-- Customer Info Section -->
        <h3 class="text-base font-semibold mb-2">{{ UI_TEXTS.delivery.sections.customerInfo }}</h3>
        <div class="space-y-1 mb-4">
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.name }}</span>
            {{ currentDelivery.customer.name }}
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.address }}</span>
            {{ currentDelivery.customer.address?.street }},
            {{ currentDelivery.customer.address?.city }}
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.comment }}</span>
            {{ currentDelivery.customer.address?.instructions || UI_TEXTS.delivery.noComments }}
          </p>
        </div>
        <hr class="border-gray-300 my-4" />

        <!-- Order Details Section -->
        <h3 class="text-base font-semibold mb-2">{{ UI_TEXTS.delivery.sections.order }}</h3>
        <div class="p-4 bg-white shadow-lg rounded-md overflow-y-auto max-h-60">
          <ul class="list-disc pl-5 space-y-1 mb-4">
            <li v-for="item in currentDelivery.items" :key="item.id" class="text-sm">
              <span class="font-medium">{{ item.name }}</span>
              (x{{ item.quantity }}) - {{ item.price.toFixed(2) }}{{ UI_TEXTS.currency.yen }}
            </li>
          </ul>
        </div>
        <hr class="border-gray-300 my-4" />

        <!-- Details Section -->
        <h3 class="text-base font-semibold mb-2">{{ UI_TEXTS.delivery.sections.orderDetails }}</h3>
        <div class="space-y-1">
          <p class="text-sm">
            <span class="font-medium">Total:</span>
            <span class="text-green-500"
              >{{ currentDelivery.total.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</span
            >
            <a
              class="text-blue-500 hover:underline text-sm cursor-pointer px-2"
              v-if="currentDelivery.paymentMethod === 'card'"
              @click="handleCalculateChange"
            >
              {{ UI_TEXTS.delivery.calculateChange.title }}
            </a>
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.paymentMethod }}</span>
            <span class="text-blue-500">{{ currentDelivery.paymentMethod }}</span>
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.paymentStatus }}</span>
            <span class="text-red-500">{{ currentDelivery.paymentStatus }}</span>
          </p>
        </div>
        <hr class="border-gray-300 my-4" />

        <!-- Delivery Details Section -->
        <h3 class="text-base font-semibold mb-2">
          {{ UI_TEXTS.delivery.sections.deliveryDetails }}
        </h3>
        <div class="space-y-1">
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.status }}</span>
            {{ currentDelivery.status }}
          </p>
          <p class="text-sm">
            <span class="font-medium">Delivery Time:</span>
            <span class="text-yellow-500">
              {{ formatTime(currentDelivery.deliveryTime) }}
              ({{ calculateCountdown(currentDelivery.deliveryTime) }})
            </span>
          </p>
          <a
            :href="`https://maps.google.com/?q=${currentDelivery.customer.address?.street}, ${currentDelivery.customer.address?.city}`"
            target="_blank"
            class="text-blue-500 hover:underline text-sm"
          >
            {{ UI_TEXTS.delivery.viewOnMap }}
          </a>
        </div>
        <hr class="border-gray-300 my-4" />

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="markAsDelivered(currentDelivery)"
            class="px-4 py-2 bg-green-500 text-white rounded text-sm"
          >
            {{ UI_TEXTS.delivery.markAsDelivered }}
          </button>
          <button
            @click="contactCustomer(currentDelivery)"
            class="px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            {{ UI_TEXTS.delivery.contactCustomer }}
          </button>
        </div>
      </div>
      <div v-else class="text-center text-gray-500">
        <p class="text-sm">{{ UI_TEXTS.delivery.noCurrentDelivery }}</p>
      </div>
    </div>

    <!-- My Deliveries Tab -->
    <div v-if="activeTab === UI_TEXTS.delivery.tabs.myDeliveries">
      <h2 class="text-lg font-bold mb-4 text-center">{{ UI_TEXTS.delivery.tabs.myDeliveries }}</h2>
      <div class="flex justify-between items-center mb-4">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            v-model="hideDelivered"
            class="form-checkbox h-4 w-4 text-blue-500"
          />
          <span class="text-sm">{{ UI_TEXTS.delivery.hideDelivered }}</span>
        </label>
      </div>
      <div
        v-for="order in visibleDeliveries"
        :key="order.id"
        class="p-4 mb-4 bg-white shadow-lg rounded-md"
      >
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-base font-semibold">Order ID: {{ order.id }}</h3>
          <span class="text-sm text-gray-500">{{ order.status }}</span>
        </div>
        <hr class="border-gray-300 my-2" />
        <div class="space-y-1">
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.customer }}</span>
            {{ order.customer.name }}
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.address }}</span>
            {{ order.customer.address?.street }},
            {{ order.customer.address?.city }}
          </p>
          <p class="text-sm">
            <span class="font-medium">{{ UI_TEXTS.delivery.labels.comment }}</span>
            {{ order.customer.address?.instructions || UI_TEXTS.delivery.noComments }}
          </p>
          <p class="text-sm">
            <span class="font-medium">Delivery Time:</span>
            {{ formatTime(order.deliveryTime) }}
            (<span class="text-red-500" v-if="!order.deliveredAt">
              {{ calculateCountdown(order.deliveryTime) }}
            </span>
            <span v-else class="text-sm text-green-500">
              {{ UI_TEXTS.delivery.labels.deliveredAt }} {{ formatTime(order.deliveredAt) }} </span
            >)
          </p>
        </div>
        <hr class="border-gray-300 my-2" />
        <details class="bg-gray-100 p-2 rounded-md">
          <summary class="cursor-pointer text-sm font-medium text-blue-500">
            {{ UI_TEXTS.delivery.orderSummary }}
          </summary>
          <ul class="list-disc pl-5 space-y-1 mt-2">
            <li v-for="item in order.items" :key="item.id" class="text-sm">
              <span class="font-medium">{{ item.name }}</span>
              (x{{ item.quantity }}) - {{ item.price.toFixed(2) }}{{ UI_TEXTS.currency.yen }}
            </li>
          </ul>
          <p class="text-sm mt-2">
            <span class="font-medium">Total:</span> {{ order.total.toFixed(2)
            }}{{ UI_TEXTS.currency.yen }}
          </p>
        </details>
        <div class="flex justify-end mt-2">
          <button
            v-if="order.status !== 'completed'"
            @click="startDelivery(order)"
            class="px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            {{ UI_TEXTS.delivery.startDelivery }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      :isOpen="showConfirmDialog"
      :title="confirmDialogProps.title"
      :message="confirmDialogProps.message"
      @cancel="showConfirmDialog = false"
      @confirm="currentDelivery && handleConfirm(currentDelivery)"
    />

    <!-- Modal for Change Calculation -->
    <template v-if="showChangeModal">
      <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow-lg w-80">
          <h3 class="text-lg font-semibold mb-4">{{ UI_TEXTS.delivery.calculateChange.title }}</h3>
          <label class="block text-sm font-medium mb-2">{{
            UI_TEXTS.delivery.calculateChange.givenAmountLabel
          }}</label>
          <input
            v-model="givenAmount"
            type="number"
            class="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            :placeholder="UI_TEXTS.delivery.calculateChange.givenAmountPlaceholder"
          />
          <p v-if="changeAmount !== null" class="text-sm text-green-500 mb-4">
            {{ UI_TEXTS.delivery.calculateChange.changeToReturn }} {{ changeAmount.toFixed(2)
            }}{{ UI_TEXTS.currency.yen }}
          </p>
          <div class="flex justify-end space-x-2">
            <button
              @click="closeChangeModal"
              class="px-4 py-2 bg-gray-500 text-white rounded text-sm"
            >
              {{ UI_TEXTS.delivery.calculateChange.cancelButton }}
            </button>
            <button
              @click="calculateChangeAmount"
              class="px-4 py-2 bg-blue-500 text-white rounded text-sm"
            >
              {{ UI_TEXTS.delivery.calculateChange.calculateButton }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ordersApi } from '../api/orders';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { formatTime } from '../utils/date';
import type { Order } from '../types/types';

const tabs = [UI_TEXTS.delivery.tabs.current, UI_TEXTS.delivery.tabs.myDeliveries];
const activeTab = ref(UI_TEXTS.delivery.tabs.current);

import { useAuthStore } from '../stores/auth';
import { UI_TEXTS } from '../constants/ui-texts';

const auth = useAuthStore();
const currentDriver = computed(() => auth.user?.name || '');
const deliveryOrders = ref<Order[]>([]);
const currentDelivery = computed(
  () =>
    deliveryOrders.value.find(
      (order) => order.status === 'delivering' && order.driver?.name === currentDriver.value
    ) || null
);

onMounted(() => {
  fetchOrders();
});

const myDeliveries = computed(() =>
  deliveryOrders.value.filter((order) => order.driver?.name === currentDriver.value)
);

const fetchOrders = async () => {
  deliveryOrders.value = await ordersApi.getOrders();
};

const contactCustomer = (order: Order) => {
  const phoneNumber = order.customer.phone;
  if (phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
  } else {
    alert('Phone number is not available for this customer.');
  }
};

const showConfirmDialog = ref(false);
const confirmDialogProps = ref({ title: '', message: '' });

const markAsDelivered = (order: Order) => {
  if (order.paymentStatus !== 'completed') {
    confirmDialogProps.value = {
      title: UI_TEXTS.delivery.dialogs.paymentReminder,
      message: `Payment status is '${order.paymentStatus}'. Please confirm payment before marking as delivered.`,
    };
  } else {
    confirmDialogProps.value = {
      title: UI_TEXTS.delivery.dialogs.deliveryConfirmation,
      message: `Order ${order.id} will be marked as delivered.`,
    };
  }
  showConfirmDialog.value = true;
};

const startDelivery = async (order: Order) => {
  const success = await ordersApi.updateOrderStatus(order.id, 'delivering');
  if (success) {
    order.status = 'delivering';
    alert(`Starting delivery for order ${order.id}.`);
  }
};

const handleConfirm = async (order: Order) => {
  if (order) {
    const success = await ordersApi.updateOrderStatus(order.id, 'completed');
    if (success) {
      order.status = 'completed';
      order.deliveredAt = new Date().toISOString();
    }
  }
  showConfirmDialog.value = false;
};

const hideDelivered = ref(true);

const filteredDeliveries = computed(() => {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalDateString(new Date());
  return myDeliveries.value.filter((order) => {
    if (!order.deliveryTime) return false;
    return getLocalDateString(new Date(order.deliveryTime)) === today;
  });
});

const visibleDeliveries = computed(() => {
  return filteredDeliveries.value.filter(
    (order) => !hideDelivered.value || order.status !== 'completed'
  );
});

const calculateCountdown = (deliveryTime: string | undefined): string => {
  if (!deliveryTime) return 'N/A';
  const now = new Date();
  const delivery = new Date(deliveryTime);
  const diff = Math.max(0, delivery.getTime() - now.getTime());
  const minutes = Math.floor(diff / 60000);
  return `${minutes} minutes remaining`;
};

const showChangeModal = ref(false);
const givenAmount = ref<number | null>(null);
const changeAmount = ref<number | null>(null);

const handleCalculateChange = () => {
  const delivery = currentDelivery.value;
  if (delivery && delivery.total) {
    showChangeModal.value = true;
    givenAmount.value = null;
    changeAmount.value = null;
  }
};

const calculateChangeAmount = () => {
  const delivery = currentDelivery.value;
  if (delivery && givenAmount.value !== null) {
    changeAmount.value = calculateChange(delivery.total, givenAmount.value);
  }
};

const closeChangeModal = () => {
  showChangeModal.value = false;
};

function calculateChange(total: number, value: number): number | null {
  if (value < total) return null;
  return value - total;
}
</script>
