<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div class="px-8 py-10">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">{{ UI_TEXTS.login.title }}</h1>
          <p class="text-gray-600">{{ UI_TEXTS.login.subtitle }}</p>
        </div>

        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>

        <div id="google-signin-button" class="flex justify-center"></div>

        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800 font-medium mb-2">{{ UI_TEXTS.login.infoBadge }}</p>
          <p class="text-xs text-blue-700">
            {{ UI_TEXTS.login.infoText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { UI_TEXTS } from '../constants/ui-texts';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

onMounted(() => {
  if (!GOOGLE_CLIENT_ID) {
    error.value =
      'Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.';
    return;
  }

  // Load Google Sign-In script
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = initializeGoogleSignIn;
  document.head.appendChild(script);
});

function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      const result = await authStore.loginWithGoogle(response.credential);

      if (result.success) {
        router.push('/'); // Redirect to the admin dashboard
      } else {
        error.value = result.message || 'Login failed. Please try again.';
      }
    },
  });

  const button = document.getElementById('google-signin-button');
  if (button) {
    google.accounts.id.renderButton(button, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    });
  }
}
</script>

<style scoped>
/* Additional styling if needed */
</style>
