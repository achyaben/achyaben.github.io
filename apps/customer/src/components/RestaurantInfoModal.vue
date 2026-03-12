<script setup lang="ts">
import { useRestaurantStore } from '../stores/restaurant';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close']);

const { info: restaurantInfo } = useRestaurantStore();
</script>

<template>
  <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
    enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      @click.self="emit('close')">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-hidden relative">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900">店舗情報</h3>
            <p class="text-sm text-gray-500 mt-1">{{ restaurantInfo.name }}</p>
          </div>
          <button @click="emit('close')"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="restaurantInfo" class="space-y-6">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">住所</h4>
              <p class="text-gray-600 mt-1">
                〒{{ restaurantInfo.address.postal }}<br />
                {{ restaurantInfo.address.prefecture }}{{ restaurantInfo.address.city
                }}{{ restaurantInfo.address.line1 }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-green-50 rounded-lg text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">営業時間</h4>
              <p class="text-gray-600 mt-1">
                平日 {{ restaurantInfo.hours.open }}:00 - {{ restaurantInfo.hours.close }}:00
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">電話番号</h4>
              <p class="text-gray-600 mt-1 font-medium">{{ restaurantInfo.phone }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 bg-pink-50 rounded-lg text-pink-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">公式ホームページ</h4>
              <a href="/" class="text-brand hover:text-brand-dark mt-1 font-medium inline-block transition-colors"
                target="_blank">
                achyaben.github.io
              </a>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              アクセス
            </h4>
            <div class="aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-inner">
              <iframe :src="restaurantInfo.address.googleMapUrl" width="100%" height="100%" style="border: 0"
                loading="lazy"></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
