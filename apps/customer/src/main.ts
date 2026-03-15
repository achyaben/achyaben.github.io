// main.ts
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './router';
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

app.use(router);

// ✅ Only init Google on non-LINE browsers
const isLineApp = /Line/i.test(navigator.userAgent);
if (!isLineApp) {
  app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  });
}

app.mount('#app');