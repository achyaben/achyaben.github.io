<template>
  <div v-if="show" class="fixed bottom-0 left-0 right-0 z-[999] p-4">
    <div
      class="bg-gray-900 text-white rounded-2xl shadow-2xl p-5 border border-gray-700 max-w-lg mx-auto relative overflow-hidden"
    >
      <!-- Background pattern -->
      <div class="absolute -right-4 -top-4 opacity-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-24 h-24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div class="flex items-start gap-4">
        <div class="bg-primary/20 p-2 rounded-xl">
          <img
            src="/assets/achyaben-logo.svg"
            alt="App Logo"
            class="h-10 w-10 rounded-lg shadow-sm"
          />
        </div>
        <div class="flex-1 pr-6">
          <h3 class="text-sm font-bold mb-1">ホーム画面に追加しませんか？</h3>
          <p class="text-xs text-gray-300 leading-relaxed">
            このアプリをホーム画面に追加すると、次回からアイコンをタップするだけで注文できます！
          </p>
        </div>
        <button
          @click="close"
          class="text-gray-400 hover:text-white absolute top-3 right-3 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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

      <!-- Device-specific instructions -->
      <div class="mt-4 pt-4 border-t border-gray-700/50">
        <div
          v-if="platform === 'ios'"
          class="flex items-center justify-center gap-2 text-xs font-medium"
        >
          <span>下部の</span>
          <div class="bg-gray-800 p-1.5 rounded-lg border border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
              <!-- Using standard share-alike icon look for iOS -->
              <rect x="0" y="0" width="24" height="24" fill="transparent" />
              <path
                stroke="currentColor"
                stroke-width="2"
                d="M4 12V20a2 2 0 0 0 2 2H18a2 2 0 0 0 2-2V12 M12 3V15 M12 3 L8 7 M12 3 L16 7"
              />
            </svg>
          </div>
          <span>を押し、 「ホーム画面に追加」をタップ</span>
        </div>
        <div v-else class="flex flex-col gap-2">
          <button
            @click="installAndroid"
            class="w-full bg-white text-gray-900 font-bold py-2 rounded-xl text-xs hover:bg-gray-100 transition shadow-inner"
          >
            今すぐ追加
          </button>
          <p class="text-[10px] text-gray-500 text-center">
            メニューの「アプリをインストール」からも追加可能です
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const show = ref(false);
const platform = ref<'ios' | 'other'>('other');
const deferredPrompt = ref<any>(null);

function isStandalone() {
  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function detectPlatform() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) {
    platform.value = 'ios';
  } else {
    platform.value = 'other';
  }
}

onMounted(() => {
  if (isStandalone()) return;

  detectPlatform();

  // Listen for beforeinstallprompt for Android/Chrome
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    checkAndShow();
  });

  // For iOS, show after a short delay since there's no event
  if (platform.value === 'ios') {
    checkAndShow();
  }
});

function checkAndShow() {
  // Check localStorage to not harass the user too much
  const hiddenTime = localStorage.getItem('a2hs_guide_dismissed');
  if (hiddenTime) {
    const timeDiff = Date.now() - parseInt(hiddenTime);
    if (timeDiff < 7 * 24 * 60 * 60 * 1000) return; // Keep it hidden for 7 days
  }

  // Also only show for actual mobile users usually, or always show for testing?
  // Let's show after a short delay to not annoy on first load
  setTimeout(() => {
    show.value = true;
  }, 3000);
}

function close() {
  show.value = false;
  localStorage.setItem('a2hs_guide_dismissed', Date.now().toString());
}

async function installAndroid() {
  if (!deferredPrompt.value) return;

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    show.value = false;
  }
  deferredPrompt.value = null;
}
</script>
