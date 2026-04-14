<template>
  <div class="flex h-screen relative">
    <!-- Navigation Container -->
    <AdminNav
      v-if="!isMobile"
      :userRole="userRole"
      @logout="handleLogout"
      @toggle-collapse="handleNavToggle"
      :class="isCollapsed ? 'w-16' : 'w-64'"
      class="transition-all duration-300 flex-shrink-0"
    />

    <!-- Main Content -->
    <div
      :class="isMobile ? 'flex-1 overflow-y-auto pb-16' : 'flex-1 overflow-y-auto'"
      class="transition-all duration-300"
    >
      <router-view />
    </div>

    <!-- Bottom Navigation for Mobile -->
    <BottomNav v-if="isMobile" :userRole="userRole" @logout="handleLogout" />

    <!-- Global Realtime Notification Toast -->
    <transition name="fade">
      <div
        v-if="newOrderAlert"
        class="fixed top-20 right-4 z-[200] bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 cursor-pointer hover:bg-blue-700 transition-all border-2 border-white/20"
        @click="newOrderAlert = null"
      >
        <div class="bg-white/20 p-2 rounded-full animate-pulse">
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <p class="font-black italic">NEW ORDER!</p>
          <div class="text-xs font-medium bg-white/10 px-2 py-0.5 rounded w-fit">
            #{{ newOrderAlert.trackingId }}
          </div>
          <p class="text-[10px] mt-1 opacity-70">Click to dismiss</p>
        </div>
        <button class="ml-2 hover:bg-white/10 p-1 rounded transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminNav from '../components/AdminNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useAuthStore } from '../stores/auth';
import { supabase } from '@app/supabase';
import { settingsApi } from '../api/settings';

const router = useRouter();
const authStore = useAuthStore();

// UI State
const isMobile = ref(window.innerWidth <= 640);
const isCollapsed = ref(false);
const newOrderAlert = ref(null);
const deliveryHours = ref(null);

// Audio
const chime = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// Computed
const userRole = computed(() => authStore.user?.role || 'guest');

// Methods
const handleResize = () => {
  isMobile.value = window.innerWidth <= 640;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const handleNavToggle = (collapsed) => {
  isCollapsed.value = collapsed;
};

const fetchDeliveryHours = async () => {
  try {
    const settings = await settingsApi.getRestaurantInfo();
    deliveryHours.value = settings.delivery_hours;
  } catch (err) {
    console.error('Failed to fetch delivery hours:', err);
  }
};

const isWithinDeliveryHours = () => {
  if (!deliveryHours.value) return true; // Default to true if not set

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = deliveryHours.value.start.split(':').map(Number);
  const [endH, endM] = deliveryHours.value.end.split(':').map(Number);

  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;

  return currentTime >= startTime && currentTime <= endTime;
};

// Realtime
let ordersSubscription = null;

const setupRealtimeNotification = () => {
  if (ordersSubscription) return;

  ordersSubscription = supabase
    .channel('global-orders-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      async (payload) => {
        console.log('Global notification: New order received!', payload);

        // Show visual alert (Permanently until manual dismissal)
        newOrderAlert.value = { trackingId: payload.new.tracking_id };

        // Play Chime ONLY if within delivery hours or if delivery hours aren't set
        if (isWithinDeliveryHours()) {
          try {
            chime.currentTime = 0;
            await chime.play();
          } catch (err) {
            console.warn('Global audio blocked. Interaction needed.', err);
          }
        } else {
          console.log('New order arrived outside delivery hours. Chime suppressed.');
        }

        // Notify other components (like OrdersView) to refresh
        window.dispatchEvent(new CustomEvent('new-order-notification', { detail: payload.new }));

        // REMOVED auto-dismiss setTimeout as per user request
      }
    )
    .subscribe();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchDeliveryHours();
  setupRealtimeNotification();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (ordersSubscription) {
    ordersSubscription.unsubscribe();
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
