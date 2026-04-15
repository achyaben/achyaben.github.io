<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore, isLineContext } from '../stores/auth';
import type { CallbackTypes } from 'vue3-google-login';
import RestaurantInfoModal from './RestaurantInfoModal.vue';

const auth = useAuthStore();
const isInfoOpen = ref(false);
const isAuthOpen = ref(false);
const showShopInfo = ref(false);
const infoDropdownRef = ref<HTMLElement | null>(null);
const authDropdownRef = ref<HTMLElement | null>(null);

const toggleInfo = () => {
  isInfoOpen.value = !isInfoOpen.value;
  isAuthOpen.value = false;
};

const toggleAuth = () => {
  isAuthOpen.value = !isAuthOpen.value;
  isInfoOpen.value = false;
};

const closeDropdowns = (e: MouseEvent) => {
  if (infoDropdownRef.value && !infoDropdownRef.value.contains(e.target as Node)) {
    isInfoOpen.value = false;
  }
  if (authDropdownRef.value && !authDropdownRef.value.contains(e.target as Node)) {
    isAuthOpen.value = false;
  }
};

const isLineLoading = ref(false);

const handleLineLogin = async () => {
  isLineLoading.value = true;
  const result = await auth.loginWithLine();
  if (result && result.error) {
    console.error('LINE login error:', result.error);
  }
  isLineLoading.value = false;
};

const handleLoginSuccess: CallbackTypes.CredentialCallback = async (response) => {
  if (response.credential) {
    await auth.loginWithGoogle(response.credential); // ✅ pass nonce from Google response
  }
};

const openShopInfo = () => {
  isInfoOpen.value = false;
  showShopInfo.value = true;
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<template>
  <div class="flex items-center gap-1.5">
    <!-- 1. Google & LINE Login (Always shown when logged out) -->
    <div
      v-if="!auth.isAuthenticated.value"
      class="flex items-center gap-2 mr-1 scale-75 sm:scale-100 origin-right"
    >
      <!-- Google: hidden in LINE browser only -->
      <GoogleLogin v-if="!isLineContext" :callback="handleLoginSuccess" :prompt="false" />
      <button
        @click="handleLineLogin"
        class="flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-xs shadow transition"
        :disabled="isLineLoading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" class="w-5 h-5 mr-1">
          <rect fill="#06C755" width="36" height="36" rx="8" />
          <path
            fill="#fff"
            d="M18 8C11.373 8 6 12.477 6 18c0 2.99 1.53 5.67 4.07 7.62-.13.44-.82 2.77-.85 2.95 0 .08.02.16.07.22.06.07.15.11.24.09.31-.04 3.09-2.04 3.6-2.38C14.7 26.82 16.32 27 18 27c6.627 0 12-4.477 12-9s-5.373-9-12-9z"
          />
        </svg>
        LINEでログイン
      </button>
    </div>

    <!-- 2. Auth Dropdown (Visible when logged in) -->
    <div
      v-if="auth.isAuthenticated.value && auth.user.value"
      class="relative"
      ref="authDropdownRef"
    >
      <button
        @click="toggleAuth"
        class="flex items-center focus:outline-none hover:opacity-80 transition p-1"
      >
        <img
          :src="auth.user.value.picture"
          alt="User"
          class="w-9 h-9 rounded-full border border-gray-200 shadow-sm"
        />
      </button>

      <!-- Auth Dropdown Menu -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isAuthOpen"
          class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 origin-top-right overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p class="text-sm font-bold text-gray-900 truncate">{{ auth.user.value.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.user.value.email }}</p>
          </div>

          <div class="py-1">
            <router-link
              to="/profile"
              class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              @click="isAuthOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              プロフィール設定
            </router-link>
            <router-link
              to="/history"
              class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              @click="isAuthOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              注文履歴
            </router-link>
          </div>

          <div class="py-1 border-t border-gray-100">
            <button
              @click="auth.logout"
              class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 3. Info Dropdown (Always visible icon + text) -->
    <div class="relative" ref="infoDropdownRef">
      <button
        @click="toggleInfo"
        class="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-xs font-bold hidden md:inline">情報</span>
      </button>

      <!-- Info Dropdown Menu -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isInfoOpen"
          class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 origin-top-right overflow-hidden"
        >
          <div class="py-1">
            <button
              @click="openShopInfo"
              class="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              店舗情報
            </button>
            <router-link
              to="/calendar"
              class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              @click="isInfoOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              営業カレンダー
            </router-link>
            <router-link
              to="/privacy"
              class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              @click="isInfoOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              プライバシーポリシー
            </router-link>

            <router-link
              to="/terms"
              class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              @click="isInfoOpen = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-3 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              利用規約
            </router-link>
          </div>
        </div>
      </transition>
    </div>

    <!-- Restaurant Info Modal -->
    <RestaurantInfoModal :show="showShopInfo" @close="showShopInfo = false" />
  </div>
</template>
