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

    <!-- Realtime Connection Lost Modal -->
    <transition name="fade">
      <div
        v-if="showRealtimeError && !realtimeErrorDismissed"
        class="fixed inset-0 z-[500] flex items-center justify-center bg-black/40"
        style="backdrop-filter: blur(2px)"
      >
        <div
          class="bg-red-600 text-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center animate-pulse max-w-[90vw] w-full max-w-md"
        >
          <span class="font-bold text-2xl mb-4">⚠️ 注文通知の接続が失われました</span>
          <p class="mb-6 text-lg text-center">
            ページをリロードしてください。<br />新しい注文の通知が届きません。
          </p>
          <div class="flex gap-4 mt-2">
            <button
              @click="reloadPage"
              class="bg-white text-red-600 font-bold px-6 py-3 rounded shadow hover:bg-red-100 transition-colors text-lg"
            >
              ページを再読み込み
            </button>
            <button
              @click="realtimeErrorDismissed = true"
              class="bg-red-700/80 text-white font-bold px-6 py-3 rounded shadow hover:bg-red-800 transition-colors text-lg"
            >
              警告を閉じる
            </button>
          </div>
          <p class="mt-4 text-sm text-white/80 text-center">
            ※ 警告を閉じても新しい注文の通知は届きません。
          </p>
        </div>
      </div>
    </transition>

    <!-- Global Realtime Notification Toast -->
    <transition name="fade">
      <div
        v-if="newOrderAlert"
        :class="['fixed inset-0 flex items-center justify-center z-[200] pointer-events-none']"
      >
        <div
          :class="[
            'pointer-events-auto text-white rounded-3xl shadow-2xl overflow-hidden transition-all border-4',
            chimeIsRinging
              ? 'bg-blue-600 border-yellow-300/80 ring-chirp'
              : 'bg-blue-600 border-white/20',
          ]"
          style="width: min(520px, calc(100vw - 2rem))"
          @click="openOrderFromAlert"
        >
          <!-- Top bar -->
          <div class="flex items-center gap-5 px-8 pt-8 pb-4">
            <div
              :class="[
                'bg-white/20 p-4 rounded-full shrink-0',
                chimeIsRinging ? 'animate-bounce' : 'animate-pulse',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12"
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
            <div class="flex-1 cursor-pointer">
              <p class="text-4xl font-black italic tracking-wide leading-tight">NEW ORDER!</p>
              <div class="text-base font-bold bg-white/15 px-4 py-1.5 rounded-xl w-fit mt-2">
                #{{ newOrderAlert.trackingId }}
              </div>
              <div v-if="newOrderAlert.deliveryDate" class="text-sm mt-2 opacity-80">
                📅 {{ newOrderAlert.deliveryDate }}
              </div>
            </div>
            <button
              class="hover:bg-white/10 p-2 rounded-xl transition-colors self-start shrink-0"
              @click.stop="dismissWithDateSet"
              title="閉じる"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Chime dots progress -->
          <div class="flex gap-2 px-8 pb-3">
            <span
              v-for="i in MAX_CHIMES"
              :key="i"
              :class="[
                'inline-block h-2.5 rounded-full transition-all duration-300',
                i <= chimeCount ? 'bg-yellow-300 w-5' : 'bg-white/20 w-2.5',
              ]"
            />
          </div>

          <div class="flex border-t border-white/10">
            <div
              class="flex-1 text-center py-3 text-sm font-bold opacity-70 cursor-pointer hover:bg-white/5"
              @click.stop="dismissWithDateSet"
            >
              ✕ 閉じるのみ
            </div>
            <div
              class="flex-1 text-center py-3 text-sm font-black bg-white/10 cursor-pointer hover:bg-white/20"
            >
              ✓ 開く＆受付
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminNav from '../components/AdminNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useAuthStore } from '../stores/auth';
import { supabase } from '@app/supabase';
import { settingsApi } from '../api/settings';
import chimeUrl from '../assets/chime.mp3';

// Fallback: show error after N failed reconnects
const MAX_RECONNECT_ATTEMPTS = 6;
const reconnectAttempts = ref(0);

const realtimeErrorDismissed = ref(false);
const showRealtimeError = computed(() => reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS);

function reloadPage() {
  window.location.reload();
}
const router = useRouter();
const authStore = useAuthStore();

// UI State
const isMobile = ref(window.innerWidth <= 640);
const isCollapsed = ref(false);
const newOrderAlert = ref<{
  trackingId: string;
  deliveryDate: string;
  deliveryDateRaw: string;
} | null>(null);
const businessHour = ref<{ open: string; close: string } | null>(null);

const chime = new Audio(chimeUrl);
chime.preload = 'auto';
chime.load();
const MAX_CHIMES = 15;
const chimeCount = ref(0);
const chimeIsRinging = ref(false);
let chimeInterval: ReturnType<typeof setInterval> | null = null;

// Unlock audio on first user interaction (browser autoplay policy)
// Without this, audio is silently blocked if the tab hasn't been clicked yet.
let audioUnlocked = false;
const unlockAudio = () => {
  if (audioUnlocked) return;
  chime
    .play()
    .then(() => {
      chime.pause();
      chime.currentTime = 0;
      audioUnlocked = true;
    })
    .catch(() => {});
};
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);

const startChimeLoop = async () => {
  chimeCount.value = 0;
  chimeIsRinging.value = true;
  const ring = async () => {
    if (!newOrderAlert.value || chimeCount.value >= MAX_CHIMES) {
      stopChimeLoop();
      return;
    }
    chimeCount.value++;
    try {
      chime.currentTime = 0;
      await chime.play();
    } catch (err) {
      console.warn('[Realtime] Audio blocked — user interaction needed first.', err);
    }
  };
  await ring();
  chimeInterval = setInterval(ring, 3000);
};

const stopChimeLoop = () => {
  chimeIsRinging.value = false;
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
};

const dismissAlert = () => {
  stopChimeLoop();
  newOrderAlert.value = null;
  chimeCount.value = 0;
};

const formatAlertDate = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return (
    d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }) +
    ' ' +
    d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  );
};

const openOrderFromAlert = () => {
  if (!newOrderAlert.value) return;
  const trackingId = newOrderAlert.value.trackingId;
  const dateRaw = newOrderAlert.value.deliveryDateRaw || '';
  dismissAlert();
  router.push({ path: '/orders', query: { open: trackingId, date: dateRaw, accept: '1' } });
};

const dismissWithDateSet = () => {
  if (!newOrderAlert.value) return;
  const trackingId = newOrderAlert.value.trackingId;
  const dateRaw = newOrderAlert.value.deliveryDateRaw || '';
  dismissAlert();
  router.push({ path: '/orders', query: { open: trackingId, date: dateRaw } });
};

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

const handleNavToggle = (collapsed: boolean) => {
  isCollapsed.value = collapsed;
};

const fetchDeliveryHours = async () => {
  try {
    const settings = await settingsApi.getRestaurantInfo();
    // settings.business_hour = { open: "11:00", close: "20:00", businessDays: [...], ... }
    businessHour.value = settings.business_hour || null;
  } catch (err) {
    console.error('Failed to fetch business hours:', err);
  }
};

const isWithinBusinessHours = () => {
  if (!businessHour.value) return true; // Default to allow chime if settings not loaded

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (businessHour.value.open || '11:00').split(':').map(Number);
  const [closeH, closeM] = (businessHour.value.close || '20:00').split(':').map(Number);

  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  return currentTime >= openTime && currentTime <= closeTime;
};

const triggerTestNotification = () => {
  const fakeId = 'TEST-' + Math.floor(Math.random() * 9000 + 1000);
  // Use tomorrow as fake delivery date for test
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  newOrderAlert.value = {
    trackingId: fakeId,
    deliveryDate: formatAlertDate(tomorrow.toISOString()),
    deliveryDateRaw: tomorrow.toISOString().slice(0, 10),
  };
  startChimeLoop();
};

// Realtime
let ordersSubscription: ReturnType<typeof supabase.channel> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const teardownRealtimeNotification = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ordersSubscription) {
    supabase.removeChannel(ordersSubscription);
    ordersSubscription = null;
  }
};

const setupRealtimeNotification = () => {
  teardownRealtimeNotification();

  ordersSubscription = supabase
    .channel('global-orders-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      async (payload) => {
        const withinHours = isWithinBusinessHours();
        newOrderAlert.value = {
          trackingId: payload.new.tracking_id,
          deliveryDate: formatAlertDate(payload.new.delivery_datetime),
          deliveryDateRaw: payload.new.delivery_datetime
            ? new Date(payload.new.delivery_datetime).toISOString().slice(0, 10)
            : '',
        };

        if (withinHours) {
          startChimeLoop();
        }

        window.dispatchEvent(new CustomEvent('new-order-notification', { detail: payload.new }));
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        reconnectAttempts.value = 0;
      }
      if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        // Let Supabase handle the actual reconnect automatically.
        // We only track attempts to show the fatal error UI if it fails repeatedly.
        reconnectAttempts.value++;
      }
    });
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('test-order-notification', triggerTestNotification);
  fetchDeliveryHours();
  setupRealtimeNotification();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('test-order-notification', triggerTestNotification);
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('keydown', unlockAudio);
  stopChimeLoop();
  teardownRealtimeNotification();
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

.ring-chirp {
  animation: chirp 0.4s ease-in-out;
}

@keyframes chirp {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  20% {
    transform: translateX(-4px) rotate(-2deg);
  }
  40% {
    transform: translateX(4px) rotate(2deg);
  }
  60% {
    transform: translateX(-3px) rotate(-1deg);
  }
  80% {
    transform: translateX(3px) rotate(1deg);
  }
  100% {
    transform: translateX(0) rotate(0deg);
  }
}
</style>
