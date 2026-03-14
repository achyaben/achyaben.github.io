import { ref, computed } from 'vue';
import { supabase } from '@app/supabase';
import liff from '@line/liff';

const token = ref<string | null>(null);
const user = ref<any>(null);
const isSoftDeleted = ref(false);
const liffLoaded = ref(false);
const liffError = ref<string | null>(null);

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    token.value = session.access_token;
    user.value = {
      ...session.user,
      picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
      name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
    };
    checkSoftDelete(session.user.id);
  } else {
    token.value = null;
    user.value = null;
    isSoftDeleted.value = false;
  }
});

// Auto-init LIFF on app start (for seamless LINE login experience)
initLiff();

async function initLiff() {
  if (liffLoaded.value) return;
  try {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
    liffLoaded.value = true;

    // ✅ Auto-login if in LINE browser
    if (liff.isInClient()) {
      if (!liff.isLoggedIn()) {
        liff.login(); // auto redirect
        return;
      }
      // Already logged in — complete Supabase session
      const idToken = liff.getIDToken();
      if (idToken && !token.value) {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-auth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: idToken }),
          }
        );
        const result = await resp.json();
        if (result.token) {
          await supabase.auth.setSession({
            access_token: result.token,
            refresh_token: result.refresh_token,
          });
        }
      }
    }
  } catch (e: any) {
    liffError.value = e.message || 'LIFF initialization failed';
    liffLoaded.value = false;
  }
}

async function checkSoftDelete(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', userId)
      .single();
    isSoftDeleted.value = !!profile?.deleted_at;
  } catch (e) {
    console.error('[Auth] Error checking soft-delete status:', e);
  }
}

export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!token.value);

  async function loginWithGoogle(credential: string) {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });
    if (error) {
      console.error('Google login failed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  async function loginWithLine() {
    await initLiff();

    if (liffError.value) {
      return { success: false, error: liffError.value };
    }

    if (!liff.isLoggedIn()) {
      liff.login();
      return { success: false, error: 'Redirecting to LINE login...' };
    }

    try {
      const idToken = liff.getIDToken();
      if (!idToken) {
        return { success: false, error: 'LINE ID token not found' };
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-auth`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
        }
      );

      const result = await resp.json();

      if (!resp.ok || !result.token) {
        return { success: false, error: result.error || 'LINE login failed' };
      }

      // ✅ Real refresh token now!
      const { error } = await supabase.auth.setSession({
        access_token: result.token,
        refresh_token: result.refresh_token,
      });

      if (error) return { success: false, error: error.message };

      return { success: true };

    } catch (e: any) {
      return { success: false, error: e.message || 'LINE login error' };
    }
  }

  async function signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Anonymous sign-in failed:', error.message);
      return { success: false, error: error.message };
    }
    token.value = data.session?.access_token || null;
    user.value = data.user;
    return { success: true };
  }

  async function refreshSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      token.value = data.session.access_token;
      user.value = data.session.user;
      await checkSoftDelete(data.session.user.id);
    } else {
      token.value = null;
      user.value = null;
      isSoftDeleted.value = false;
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    token.value = null;
    user.value = null;
    isSoftDeleted.value = false;
    window.location.reload();
  }

  return {
    token,
    user,
    isAuthenticated,
    isSoftDeleted: computed(() => isSoftDeleted.value),
    loginWithGoogle,
    loginWithLine,
    signInAnonymously,
    refreshSession,
    logout,
    liffLoaded,
    liffError,
    initLiff,
  };
};