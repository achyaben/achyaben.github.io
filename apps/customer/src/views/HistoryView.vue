<template>
  <div class="min-h-screen bg-gray-50">
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
          <h1 class="text-xl font-bold ml-4">注文履歴</h1>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <div v-if="isLoading" class="flex justify-center py-12">
        <svg
          class="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
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

      <div v-else-if="!orders.length" class="text-center py-12">
        <p class="text-gray-600 mb-4">注文履歴がありません</p>
        <router-link
          to="/"
          class="inline-block bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          メニューに戻る
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in sortedOrders"
          :key="order.id"
          @click="$router.push(`/order/${order.trackingId}`)"
          class="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="p-4 border-b">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <div class="font-medium text-gray-900">注文番号: {{ order.trackingId }}</div>
                  <span
                    v-if="order.order_type"
                    :class="
                      order.order_type === 'pickup'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    "
                    class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                  >
                    {{ order.order_type === 'pickup' ? '店頭受取' : 'お届け' }}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  {{ order.deliveryTime ? formatDate(order.deliveryTime) : '日時未定' }}
                </div>
                <div class="text-sm text-gray-500 mt-1">{{ order.items.length }}品</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-primary">¥{{ order.total }}</div>
                <div class="text-sm">
                  <span
                    :class="{
                      'text-green-600': order.status === 'completed',
                      'text-blue-600': order.status === 'delivering' || order.status === 'ready',
                      'text-orange-500': order.status === 'preparing',
                      'text-yellow-600': order.status === 'pending' || order.status === 'confirmed',
                      'text-red-600': order.status === 'cancelled',
                    }"
                  >
                    {{ statusText[order.status] }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ordersApi } from '../data/api/orders';
import type { Order } from '../types';

const orders = ref<Order[]>([]);

const statusText = {
  pending: '注文確認中',
  confirmed: '受信済み',
  preparing: '調理中',
  ready: '準備完了',
  delivering: '配達中',
  completed: '完了',
  cancelled: 'キャンセル',
} as const;

const isLoading = ref(true);

onMounted(async () => {
  try {
    orders.value = await ordersApi.getOrders();
  } finally {
    isLoading.value = false;
  }
});

const sortedOrders = computed(() => {
  return [...orders.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
});

function formatDate(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
</script>
