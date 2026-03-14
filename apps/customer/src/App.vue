<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderStatus from './components/HeaderStatus.vue';
import UserMenu from './components/UserMenu.vue';
import MaintenanceView from './views/MaintenanceView.vue';
import NetworkErrorView from './views/NetworkErrorView.vue';
import { getImageUrl } from './utils/image';
import { supabase } from '@app/supabase';
import { useRestaurantStore } from './stores/restaurant';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { watch } from 'vue';

const { fetchInfo, info, isError, orderingEnabled } = useRestaurantStore();
const { isSoftDeleted } = useAuthStore();
const router = useRouter();
const publicHealthStatus = ref('Connecting...');

const PUBLIC_ROUTES = ['calendar', 'privacy', 'terms', 'recovery', 'notFound'];

watch(
  isSoftDeleted,
  (deleted) => {
    if (deleted && !PUBLIC_ROUTES.includes(router.currentRoute.value.name as string)) {
      router.push('/recovery');
    }
  },
  { immediate: true }
);

onMounted(async () => {
  fetchInfo();
  const { error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'restaurant_name')
    .maybeSingle();
  if (error) {
    console.error('Supabase connection error:', error);
    publicHealthStatus.value = `Backend: Error connecting`;
  } else {
    publicHealthStatus.value = `Connected to Server`;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <!-- 1. Network Error (Priority 1: Connection Failed) -->
    <NetworkErrorView v-if="isError" />

    <!-- 2. Maintenance Mode (Priority 2: Connected but Disabled) -->
    <MaintenanceView v-else-if="!orderingEnabled" />

    <!-- 3. Normal App Content (Priority 3: Connected & Enabled) -->
    <template v-else>
      <!-- Navbar -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
        <div class="container mx-auto px-2 h-16 flex justify-between items-center">
          <router-link to="/"
            class="flex items-center space-x-2 text-base md:text-xl font-bold tracking-tight text-gray-900 hover:opacity-80 transition">
            <img :src="getImageUrl('/assets/achyaben-logo.svg')" alt="App Logo" class="h-8 w-8 rounded-lg" />
            <!--  smaller appname in sm -->
            <span class="w-14 text-xs sm:text-base">{{ info.app_name }}</span>
          </router-link>
          <UserMenu />
        </div>
      </div>

      <HeaderStatus />

      <main>
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in" enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <footer class="mt-12 py-6 text-center text-sm text-gray-400">
        <a href="/" class="text-primary hover:text-primary-dark transition-colors">ホームページ </a>
        <span class="mb-2">&copy; {{ info.name }}</span>
      </footer>
    </template>
  </div>
</template>
