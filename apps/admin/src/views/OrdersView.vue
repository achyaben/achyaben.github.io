<template>
  <div class="p-4">
    <!-- Tabs -->
    <div class="mb-4">
      <div class="flex border-b border-gray-300">
        <button
          v-for="(label, key) in UI_TEXTS.orders.tabs"
          :key="key"
          @click="activeTab = key"
          :class="[
            'px-4 py-2',
            activeTab === key ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500',
          ]"
          class="focus:outline-none"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Filters (Shared/Contextual) -->
    <div class="mb-4 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-bold text-gray-700">{{ UI_TEXTS.orders.filterLabel }}</span>
        <select v-model="selectedDateFilter" class="form-select border rounded px-2 py-1 bg-white">
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="specific">Specific Date</option>
        </select>
        <input
          v-if="selectedDateFilter === 'specific'"
          type="date"
          v-model="specificDate"
          class="form-input border rounded px-2 py-1 bg-white"
        />
      </div>

      <div class="flex items-center space-x-2">
        <span class="text-sm font-bold text-gray-700">{{
          UI_TEXTS.orders.deliveryList.filters.postalCodeLabel
        }}</span>
        <input
          v-model="postalCodeFilter"
          type="text"
          placeholder="e.g. 100"
          class="border rounded px-2 py-1 w-24 bg-white"
        />
      </div>

      <div class="flex items-center space-x-2 flex-grow">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="UI_TEXTS.orders.deliveryList.filters.searchPlaceholder"
          class="border rounded px-2 py-1 w-full max-w-xs bg-white"
        />
      </div>
    </div>

    <!-- Kitchen Prep Tab (Batch) -->
    <div v-if="activeTab === 'kitchenPrep'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          {{ UI_TEXTS.orders.kitchenPrep.title }} - {{ selectedDateDisplay }}
        </h2>
        <button
          @click="printBatchPrep"
          class="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 flex items-center justify-center"
        >
          <PrinterIcon class="h-5 w-5 mr-2" />
          {{ UI_TEXTS.orders.kanban.buttons.print }}
        </button>
      </div>
      <table class="table-auto w-full text-left border-collapse border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.orders.kitchenPrep.headers.item }}
            </th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.orders.kitchenPrep.headers.customs }}
            </th>
            <th class="border border-gray-300 px-4 py-2 text-center">
              {{ UI_TEXTS.orders.kitchenPrep.headers.qty }}
            </th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.orders.kitchenPrep.headers.comments }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in groupedPrepItems" :key="index" class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-2 font-medium">{{ item.name }}</td>
            <td class="border border-gray-300 px-4 py-2">
              <ul class="text-xs text-gray-600">
                <li v-for="(custom, i) in item.customizations" :key="i">• {{ custom }}</li>
              </ul>
            </td>
            <td
              class="border border-gray-300 px-4 py-2 text-center font-bold text-lg text-blue-600"
            >
              {{ item.quantity }}
            </td>
            <td class="border border-gray-300 px-4 py-2 text-sm">
              <div v-for="(comment, idx) in item.comments" :key="idx" class="mb-1 leading-tight">
                <span class="text-blue-600 font-bold">#{{ comment.orderNumber }}</span
                >: {{ comment.text }}
              </div>
            </td>
          </tr>
          <tr v-if="groupedPrepItems.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-400 italic">
              No items found for this selection.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delivery List Tab (Area Grouping) -->
    <div v-if="activeTab === 'deliveryList'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">
          {{ UI_TEXTS.orders.deliveryList.title }} - {{ selectedDateDisplay }}
        </h2>
        <div class="flex gap-2">
          <button
            @click="batchUpdateStatus('delivering')"
            class="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
          >
            {{ UI_TEXTS.orders.deliveryList.batchActions.markDelivering }}
          </button>
          <button
            @click="batchUpdateStatus('completed')"
            class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            {{ UI_TEXTS.orders.deliveryList.batchActions.markCompleted }}
          </button>
          <button
            @click="printDeliveryList"
            class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 flex items-center"
          >
            <PrinterIcon class="h-4 w-4 mr-1" />
            {{ UI_TEXTS.orders.kanban.buttons.print }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto shadow-sm border rounded-lg">
        <table class="table-auto w-full text-left border-collapse bg-white">
          <thead class="bg-gray-100 text-xs font-bold uppercase text-gray-600">
            <tr>
              <th class="px-4 py-3 border-b">{{ UI_TEXTS.orders.deliveryList.headers.time }}</th>
              <th class="px-4 py-3 border-b">
                {{ UI_TEXTS.orders.deliveryList.headers.customer }}
              </th>
              <th class="px-4 py-3 border-b">{{ UI_TEXTS.orders.deliveryList.headers.company }}</th>
              <th class="px-4 py-3 border-b">{{ UI_TEXTS.orders.deliveryList.headers.address }}</th>
              <th class="px-4 py-3 border-b">{{ UI_TEXTS.orders.deliveryList.headers.items }}</th>
              <th class="px-4 py-3 border-b text-right">
                {{ UI_TEXTS.orders.deliveryList.headers.total }}
              </th>
              <th class="px-4 py-3 border-b text-center">
                {{ UI_TEXTS.orders.deliveryList.headers.status }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, postalCode) in ordersByPostalCode" :key="postalCode">
              <!-- Postal Code Group Header -->
              <tr class="bg-blue-50">
                <td colspan="7" class="px-4 py-2 font-bold text-blue-800 border-y border-blue-100">
                  <div class="flex items-center">
                    <MapPinIcon class="h-4 w-4 mr-1" />
                    Area: {{ postalCode || 'N/A' }} ({{ group.length }} orders)
                  </div>
                </td>
              </tr>
              <!-- Group Orders -->
              <tr
                v-for="order in group"
                :key="order.id"
                @click="selectOrder(order)"
                class="hover:bg-gray-100 cursor-pointer border-b text-sm transition-colors"
              >
                <td class="px-4 py-3 font-medium text-gray-700">
                  {{ formatTime(order.deliveryTime) }}
                </td>
                <td class="px-4 py-3">
                  <div class="font-bold">#{{ order.trackingId }}</div>
                  <div class="text-xs text-gray-500">{{ order.customer.name }}</div>
                  <div class="text-xs text-blue-500">{{ order.customer.phone }}</div>
                </td>
                <td class="px-4 py-3 italic">{{ order.customer.company || '-' }}</td>
                <td class="px-4 py-3 leading-tight max-w-xs">
                  <div class="font-medium">{{ order.customer.address.street }}</div>
                </td>
                <td class="px-4 py-3 text-xs">
                  <div v-for="item in order.items" :key="item.id">
                    {{ item.quantity }}x {{ item.name }}
                    <div
                      v-if="item.options && item.options.length"
                      class="text-xs text-gray-500 pl-4"
                    >
                      {{ formatOptionsStr(item.options) }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right font-bold text-gray-900">
                  ¥{{ order.total.toFixed(0) }}
                </td>
                <td class="px-4 py-3 text-center" @click.stop>
                  <select
                    v-model="order.status"
                    @change="manualStatusUpdate(order)"
                    class="text-xs border rounded p-1"
                    :class="getStatusBg(order.status)"
                  >
                    <option v-for="s in STATUS_FLOW" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
              </tr>
            </template>
            <tr v-if="filteredDailyOrders.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-400 italic">
                No orders found for this area/selection.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Single Orders Tab (Filterable Kanban) -->
    <div v-if="activeTab === 'singleOrders'">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">{{ UI_TEXTS.orders.title }}</h1>
        <label class="flex items-center space-x-2 bg-white px-2 py-1 rounded border shadow-sm">
          <input
            type="checkbox"
            v-model="hideDeliveredAndDelivering"
            class="form-checkbox text-blue-500"
            checked
          />
          <span class="text-sm">{{ UI_TEXTS.orders.hideDeliveredAndDeliveringLabel }}</span>
        </label>
      </div>

      <div class="flex flex-col md:flex-row gap-4 pb-16">
        <!-- Kanban Board -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto">
          <div
            v-for="status in filteredStatuses"
            :key="status"
            :class="getStatusColor(status) + ' p-4 rounded-xl shadow-sm border'"
          >
            <h2
              class="text-xs font-black mb-4 uppercase tracking-widest text-gray-600 flex justify-between"
            >
              {{ status }}
              <span class="bg-white bg-opacity-50 px-2 py-0.5 rounded-full">{{
                filteredOrdersByStatus[status].length
              }}</span>
            </h2>

            <div
              v-for="order in filteredOrdersByStatus[status]"
              :key="order.id"
              class="bg-white p-4 rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              @click="selectOrder(order)"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="text-sm font-black">#{{ order.trackingId }}</div>
                <div
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase"
                >
                  {{ formatTime(order.deliveryTime) }}
                </div>
              </div>
              <p class="text-xs italic text-gray-500 mb-1">{{ order.customer.company || '-' }}</p>
              <p class="text-sm font-medium mb-2">{{ order.customer.name }}</p>
              <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                <span class="font-black text-blue-600">¥{{ order.total.toFixed(0) }}</span>
                <div class="flex gap-1">
                  <button
                    v-if="order.status !== 'pending'"
                    @click.stop="updateOrderStatus(order, 'prev')"
                    class="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeftIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="canUpdateStatus(order)"
                    @click.stop="updateOrderStatus(order)"
                    class="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <ArrowRightIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full-Screen Modal for Order Details (Global) -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 transition-all"
      @click.self="closeOrderDetail"
    >
      <div
        class="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          @click="closeOrderDetail"
          class="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>

        <div class="flex items-center gap-3 mb-6">
          <h2 class="text-3xl font-black">#{{ selectedOrder.trackingId }}</h2>
          <span
            :class="
              getStatusColor(selectedOrder.status) +
              ' px-3 py-1 rounded-full text-xs font-black uppercase'
            "
            >{{ selectedOrder.status }}</span
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-[10px] font-black text-gray-400 uppercase mb-2">Customer</p>
              <p class="font-black text-lg">{{ selectedOrder.customer.name }}</p>
              <p class="text-sm text-gray-600">{{ selectedOrder.customer.phone }}</p>
              <p
                v-if="selectedOrder.customer.company"
                class="mt-2 text-xs italic text-blue-500 font-bold"
              >
                {{ selectedOrder.customer.company }}
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-xl">
              <p class="text-[10px] font-black text-gray-400 uppercase mb-2">Delivery Address</p>
              <p class="text-sm font-bold">[{{ selectedOrder.customer.address.postalCode }}]</p>
              <p class="text-sm">{{ selectedOrder.customer.address.street }}</p>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <p class="text-[10px] font-black text-gray-400 uppercase mb-4">Items Summary</p>
          <table class="w-full text-left">
            <thead class="text-xs text-gray-400 uppercase">
              <tr class="border-b">
                <th class="pb-2">Item</th>
                <th class="pb-2 text-center">Qty</th>
                <th class="pb-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="item in selectedOrder.items" :key="item.id" class="border-b last:border-0">
                <td class="py-3">
                  <div class="font-bold">{{ item.name }}</div>
                  <div
                    v-if="item.options && item.options.length"
                    class="text-xs text-gray-500 mt-1"
                  >
                    + {{ formatOptionsStr(item.options) }}
                  </div>
                </td>
                <td class="py-3 text-center align-top">x{{ item.quantity }}</td>
                <td class="py-3 text-right align-top">¥{{ item.price.toFixed(0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-6 border-t font-black text-2xl">
          <span class="text-gray-400 uppercase text-xs">Total Order Value</span>
          <span class="text-blue-600">¥{{ selectedOrder.total.toFixed(0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Order, OrderItem, OrderItemOption } from '../types/types';
import { ordersApi } from '../api/orders';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PrinterIcon,
  XMarkIcon,
  MapPinIcon,
} from '@heroicons/vue/24/solid';
import { UI_TEXTS } from '../constants/ui-texts';

const activeTab = ref<keyof typeof UI_TEXTS.orders.tabs>('deliveryList');
const orders = ref<Order[]>([]);
const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'completed'];
const selectedOrder = ref<Order | null>(null);
const hideDeliveredAndDelivering = ref(true);

// Filters
const selectedDateFilter = ref('today');
const specificDate = ref('');
const searchQuery = ref('');
const postalCodeFilter = ref('');

onMounted(async () => {
  await fetchOrders();
});

const fetchOrders = async () => {
  try {
    orders.value = await ordersApi.getOrders();
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatOptionsList = (options?: OrderItemOption[]) => {
  if (!options || !options.length) return [];
  const counts: Record<
    string,
    {
      qty: number;
      unitPrice: number;
      sort_order: number;
      group_sort_order: number;
      group_required: boolean;
    }
  > = {};
  options.forEach((opt) => {
    const name = opt.choice || opt.name;
    if (name) {
      if (!counts[name])
        counts[name] = {
          qty: 0,
          unitPrice: opt.price || 0,
          sort_order: opt.sort_order || 0,
          group_sort_order: opt.group_sort_order || 0,
          group_required: opt.group_required || false,
        };
      counts[name].qty += 1;
      if (opt.price) counts[name].unitPrice = opt.price;
    }
  });
  return Object.entries(counts)
    .sort(([nameA, aData], [nameB, bData]) => {
      // 1. Group Sort Order
      if (aData.group_sort_order !== bData.group_sort_order) {
        return aData.group_sort_order - bData.group_sort_order;
      }
      // 2. Group Required (Tie-breaker for group)
      if (aData.group_required !== bData.group_required) {
        return aData.group_required ? -1 : 1;
      }
      // 3. Option Sort Order (Tie-breaker within group)
      if (aData.sort_order !== bData.sort_order) {
        return aData.sort_order - bData.sort_order;
      }
      // 4. Name (Final stability)
      return (nameA || '').localeCompare(nameB || '');
    })
    .map(([name, data]) => {
      let text = data.qty > 1 ? `${name} ×${data.qty}` : name;
      if (data.unitPrice > 0) {
        text += ` (+¥${data.unitPrice * data.qty})`;
      }
      return text;
    });
};

const formatOptionsStr = (options?: any[]) => formatOptionsList(options).join(', ');

const selectedDateDisplay = computed(() => {
  const today = new Date();
  if (selectedDateFilter.value === 'today') return getLocalDateString(today);
  if (selectedDateFilter.value === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return getLocalDateString(tomorrow);
  }
  if (selectedDateFilter.value === 'specific' && specificDate.value) return specificDate.value; // Already YYYY-MM-DD from input[type=date]
  return '--';
});

const filteredDailyOrders = computed(() => {
  const targetDateStr = selectedDateDisplay.value;
  return orders.value
    .filter((order) => {
      // 1. Date Filter
      const matchesDate = order.deliveryTime
        ? getLocalDateString(new Date(order.deliveryTime)) === targetDateStr
        : false;
      if (!matchesDate) return false;

      // 2. Postal Code Filter
      if (
        postalCodeFilter.value &&
        !order.customer.address.postalCode.includes(postalCodeFilter.value)
      )
        return false;

      // 3. Search Query
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        const matchesSearch =
          order.trackingId.toLowerCase().includes(q) ||
          order.customer.name.toLowerCase().includes(q) ||
          (order.customer.company && order.customer.company.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = a.deliveryTime ? new Date(a.deliveryTime).getTime() : 0;
      const timeB = b.deliveryTime ? new Date(b.deliveryTime).getTime() : 0;
      return timeA - timeB;
    });
});

const ordersByPostalCode = computed(() => {
  const groups: Record<string, Order[]> = {};
  filteredDailyOrders.value.forEach((order) => {
    const pc = order.customer.address.postalCode || 'Other';
    if (!groups[pc]) groups[pc] = [];
    groups[pc].push(order);
  });
  return groups;
});

const groupedPrepItems = computed(() => {
  const itemMap: Record<
    string,
    {
      name: string;
      customizations: string[];
      quantity: number;
      comments: { text: string; orderNumber: string }[];
    }
  > = {};

  filteredDailyOrders.value.forEach((order: Order) => {
    order.items.forEach((item: OrderItem) => {
      const itemName = item.name;
      const itemOptions = formatOptionsList(item.options);
      const itemKey = `${itemName} - ${itemOptions.join(', ')}`;

      if (itemName) {
        if (!itemMap[itemKey]) {
          itemMap[itemKey] = {
            name: itemName,
            customizations: itemOptions,
            quantity: 0,
            comments: [],
          };
        }
        itemMap[itemKey].quantity += item.quantity;
        if (order.comments) {
          itemMap[itemKey].comments.push({ text: order.comments, orderNumber: order.trackingId });
        }
      }
    });
  });

  return Object.values(itemMap);
});

const filteredOrdersByStatus = computed(() => {
  return STATUS_FLOW.reduce(
    (acc: Record<string, Order[]>, status: string) => {
      acc[status] = filteredDailyOrders.value.filter((order: Order) => {
        const matchesStatus = order.status === status;
        const isVisible = !(
          hideDeliveredAndDelivering.value &&
          (order.status === 'completed' || order.status === 'delivering')
        );
        return matchesStatus && isVisible;
      });
      return acc;
    },
    {} as Record<string, Order[]>
  );
});

const filteredStatuses = computed(() => {
  return hideDeliveredAndDelivering.value
    ? STATUS_FLOW.filter((status: string) => !['completed', 'delivering'].includes(status))
    : STATUS_FLOW;
});

const formatTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const canUpdateStatus = (order: Order) => {
  return STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
};

const manualStatusUpdate = async (order: Order) => {
  const success = await ordersApi.updateOrderStatus(order.id, order.status);
  if (!success) {
    alert('Failed to update status');
    await fetchOrders(); // Revert on failure
  }
};

const updateOrderStatus = async (order: Order, direction: 'next' | 'prev' = 'next') => {
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  let newStatus = order.status;

  if (direction === 'next' && currentIndex < STATUS_FLOW.length - 1) {
    newStatus = STATUS_FLOW[currentIndex + 1] as Order['status'];
  } else if (direction === 'prev' && currentIndex > 0) {
    newStatus = STATUS_FLOW[currentIndex - 1] as Order['status'];
  }

  if (newStatus !== order.status) {
    const success = await ordersApi.updateOrderStatus(order.id, newStatus);
    if (success) {
      order.status = newStatus;
    }
  }
};

const batchUpdateStatus = async (status: string) => {
  if (
    !confirm(
      `Are you sure you want to mark all ${filteredDailyOrders.value.length} orders as ${status}?`
    )
  )
    return;

  const promises = filteredDailyOrders.value.map((order) =>
    ordersApi.updateOrderStatus(order.id, status)
  );

  await Promise.all(promises);
  await fetchOrders();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'accepted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'preparing':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ready':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'delivering':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'delivering':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-white';
  }
};

const _calculateTimeRemaining = (createdAt: string) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const diffInMs = now.getTime() - createdTime.getTime();
  const mins = Math.floor(diffInMs / (1000 * 60));
  return `${mins}m ago`;
};

const printBatchPrep = () => {
  const printContent = `
    <html>
      <head>
        <title>Batch Prep Guide</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 10px; text-align: left; }
          th { background: #eee; }
          .qty { font-size: 24px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Kitchen Batch Prep - ${selectedDateDisplay.value}</h1>
        <table>
          <thead><tr><th>Item</th><th>Customizations</th><th>Qty</th><th>Notes (Order#)</th></tr></thead>
          <tbody>
            ${groupedPrepItems.value
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.customizations.join(', ')}</td>
                <td class="qty">${item.quantity}</td>
                <td>${item.comments.map((c) => `#${c.orderNumber}: ${c.text}`).join('<br>')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  win?.document.write(printContent);
  win?.document.close();
  win?.focus();
  win?.print();
};

const printDeliveryList = () => {
  const printContent = `
    <html>
      <head>
        <title>Delivery Area List</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .group { margin-bottom: 40px; border: 2px solid #000; padding: 10px; }
          .area-head { background: #000; color: #fff; padding: 10px; font-size: 20px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
          .order-row { background: #fff; }
        </style>
      </head>
      <body>
        <h1>Delivery Routes - ${selectedDateDisplay.value}</h1>
        ${Object.entries(ordersByPostalCode.value)
          .map(
            ([pc, group]) => `
          <div class="group">
            <div class="area-head">AREA: ${pc} (${group.length} orders)</div>
            <table>
              <thead>
                <tr>
                  <th>Time</th><th>ID</th><th>Company</th><th>Customer</th><th>Phone</th><th>Address</th><th>Items</th>
                </tr>
              </thead>
              <tbody>
                ${group
                  .map(
                    (order) => `
                  <tr>
                    <td>${formatTime(order.deliveryTime)}</td>
                    <td>#${order.trackingId}</td>
                    <td>${order.customer.company || '-'}</td>
                    <td>${order.customer.name}</td>
                    <td>${order.customer.phone}</td>
                     <td>${order.customer.address.street}</td>
                     <td>${order.items
                       .map((i) => {
                         const optsStr = formatOptionsStr(i.options);
                         const opts = optsStr ? ` (${optsStr})` : '';
                         return `${i.quantity}x ${i.name}${opts}`;
                       })
                       .join(', ')}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          )
          .join('')}
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  win?.document.write(printContent);
  win?.document.close();
  win?.focus();
  win?.print();
};

const selectOrder = (order: Order) => {
  selectedOrder.value = order;
};
const closeOrderDetail = () => {
  selectedOrder.value = null;
};
</script>
