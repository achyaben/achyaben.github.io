<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ UI_TEXTS.orderSummary.title }}</h1>

    <!-- Tabs -->
    <div class="mb-4">
      <div class="flex border-b border-gray-300">
        <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="[
          'px-4 py-2',
          activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500',
        ]" class="focus:outline-none">
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Current Summary Tab -->
    <div v-if="activeTab === 'Current Summary'">
      <div class="mb-4">
        <!-- Quick Filters + Custom Date Range -->
        <div class="mb-4">
          <span class="mr-2">{{ UI_TEXTS.orderSummary.quickFilterLabel }}</span>
          <select v-model="selectedQuickFilter" @change="applyQuickFilter" class="form-select">
            <option v-for="(label, key) in UI_TEXTS.orderSummary.quickFilters" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
          <input type="date" v-model="startDate" class="form-input" />
          <input type="date" v-model="endDate" class="form-input" />
          <button @click="clearFilters" class="bg-red-500 text-white px-4 py-2 rounded">
            Clear
          </button>
        </div>

        <!-- Grouping Filters -->
        <div class="mb-4">
          <label class="flex items-center space-x-2">
            <span>{{ UI_TEXTS.orderSummary.groupByLabel }}</span>
            <select v-model="selectedDateRange" class="form-select">
              <option v-for="(label, key) in UI_TEXTS.orderSummary.groupByOptions" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table-auto w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="border-b border-gray-300 py-2">
                {{ UI_TEXTS.orderSummary.headers.date }}
              </th>
              <th class="border-b border-gray-300 py-2">
                {{ UI_TEXTS.orderSummary.headers.totalOrders }}
              </th>
              <th class="border-b border-gray-300 py-2">
                {{ UI_TEXTS.orderSummary.headers.totalRevenue }}
              </th>
              <th class="border-b border-gray-300 py-2">Cash</th>
              <th class="border-b border-gray-300 py-2">Card</th>
              <th class="border-b border-gray-300 py-2">PayPay</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="summary in groupedSummaries" :key="summary.date">
              <td class="py-2">{{ summary.date }}</td>
              <td class="py-2">{{ summary.totalOrders }}</td>
              <td class="py-2">{{ summary.totalRevenue.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ summary.cash.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ summary.card.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ summary.paypay.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
            </tr>
            <tr class="font-bold">
              <td class="py-2">Total</td>
              <td class="py-2">{{ totalOrders }}</td>
              <td class="py-2">{{ totalRevenue.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ totalCash.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ totalCard.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
              <td class="py-2">{{ totalPayPay.toFixed(2) }}{{ UI_TEXTS.currency.yen }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Performance and Analysis Tab -->
    <div v-if="activeTab === 'Performance and Analysis'">
      <h2 class="text-xl font-bold mb-4">Top-Selling Menu Items</h2>
      <MenuPerformanceChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ordersApi } from '../api/orders';
import { UI_TEXTS } from '../constants/ui-texts';
import type { OrderSummary } from '../types/types';
import MenuPerformanceChart from '../components/MenuPerformanceChart.vue';

const tabs = ['Current Summary', 'Performance and Analysis'];
const activeTab = ref('Current Summary');

const selectedDateRange = ref('daily');
const startDate = ref('');
const endDate = ref('');
const summaries = ref<OrderSummary[]>([]);

const selectedQuickFilter = ref('Today');

onMounted(async () => {
  summaries.value = await ordersApi.getOrderSummaries();
  selectedQuickFilter.value = 'today'; // Use the correct key from UI_TEXTS
  applyQuickFilter(); // Apply the default filter immediately
});

const applyQuickFilter = () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  switch (selectedQuickFilter.value.toLowerCase()) {
    case 'today':
      {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        startDate.value = `${year}-${month}-${day}`;
        endDate.value = startDate.value;
      }
      break;
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      startDate.value = yesterday.toISOString().split('T')[0];
      endDate.value = startDate.value;
      break;
    case 'this week':
      startDate.value = startOfWeek.toISOString().split('T')[0];
      endDate.value = new Date().toISOString().split('T')[0];
      break;
    case 'this month':
      startDate.value = startOfMonth.toISOString().split('T')[0];
      endDate.value = new Date().toISOString().split('T')[0];
      break;
    case 'last month':
      startDate.value = startOfLastMonth.toISOString().split('T')[0];
      endDate.value = endOfLastMonth.toISOString().split('T')[0];
      break;
    case 'all':
      startDate.value = '';
      endDate.value = '';
      break;
  }
};

const filteredSummaries = computed(() => {
  if (selectedQuickFilter.value === 'All' || (!startDate.value && !endDate.value)) {
    return summaries.value; // Show all summaries if 'All' is selected or no date range is set
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  return summaries.value.filter((summary: OrderSummary) => {
    const summaryDate = new Date(summary.date);
    return summaryDate >= start && summaryDate <= end;
  });
});

const clearFilters = () => {
  startDate.value = '';
  endDate.value = '';
};

const totalOrders = computed(() => {
  return filteredSummaries.value.reduce(
    (sum: number, summary: OrderSummary) => sum + summary.totalOrders,
    0
  );
});

const totalRevenue = computed(() => {
  return filteredSummaries.value.reduce(
    (sum: number, summary: OrderSummary) => sum + summary.totalRevenue,
    0
  );
});

const totalCash = computed(() => {
  return filteredSummaries.value.reduce(
    (sum: number, summary: OrderSummary) => sum + summary.cash,
    0
  );
});

const totalCard = computed(() => {
  return filteredSummaries.value.reduce(
    (sum: number, summary: OrderSummary) => sum + summary.card,
    0
  );
});

const totalPayPay = computed(() => {
  return filteredSummaries.value.reduce(
    (sum: number, summary: OrderSummary) => sum + summary.paypay,
    0
  );
});

const groupedSummaries = computed(() => {
  const dataToGroup = filteredSummaries.value;
  if (selectedDateRange.value === 'daily') {
    return dataToGroup;
  } else if (selectedDateRange.value === 'weekly') {
    const grouped: Record<
      string,
      {
        date: string;
        totalOrders: number;
        totalRevenue: number;
        cash: number;
        card: number;
        paypay: number;
      }
    > = {};
    dataToGroup.forEach((summary: OrderSummary) => {
      const week = new Date(summary.date);
      week.setDate(week.getDate() - week.getDay()); // Start of the week
      const weekKey = week.toISOString().split('T')[0];
      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          date: weekKey,
          totalOrders: 0,
          totalRevenue: 0,
          cash: 0,
          card: 0,
          paypay: 0,
        };
      }
      grouped[weekKey].totalOrders += summary.totalOrders;
      grouped[weekKey].totalRevenue += summary.totalRevenue;
      grouped[weekKey].cash += summary.cash;
      grouped[weekKey].card += summary.card;
      grouped[weekKey].paypay += summary.paypay;
    });
    return Object.values(grouped);
  } else if (selectedDateRange.value === 'monthly') {
    const grouped: Record<
      string,
      {
        date: string;
        totalOrders: number;
        totalRevenue: number;
        cash: number;
        card: number;
        paypay: number;
      }
    > = {};
    dataToGroup.forEach((summary: OrderSummary) => {
      const month = new Date(summary.date);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          date: monthKey,
          totalOrders: 0,
          totalRevenue: 0,
          cash: 0,
          card: 0,
          paypay: 0,
        };
      }
      grouped[monthKey].totalOrders += summary.totalOrders;
      grouped[monthKey].totalRevenue += summary.totalRevenue;
      grouped[monthKey].cash += summary.cash;
      grouped[monthKey].card += summary.card;
      grouped[monthKey].paypay += summary.paypay;
    });
    return Object.values(grouped);
  }
  return dataToGroup;
});
</script>

<style scoped>
/* Add any specific styles for the Order Summary page here */
</style>
