<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

function parseHash(hash: string) {
  const params: Record<string, string> = {};
  hash
    .replace(/^#/, '')
    .split('&')
    .forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) params[key] = decodeURIComponent(value);
    });
  return params;
}

onMounted(() => {
  const hash = window.location.hash;
  const params = parseHash(hash);
  if (params.access_token) {
    auth.token.value = params.access_token;
    localStorage.setItem('app-auth-token', params.access_token);
    // Optionally, fetch user info from Supabase
    // await auth.refreshSession();
    router.replace('/'); // Redirect to home or dashboard
  } else {
    // Handle error or invalid login
    router.replace('/login');
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="text-lg font-semibold">Authenticating...</div>
  </div>
</template>
