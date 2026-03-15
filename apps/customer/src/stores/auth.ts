import { ref, computed } from 'vue';
import { supabase } from '@app/supabase';
import liff from '@line/liff';

const token = ref<string | null>(null);
const user = ref<any>(null);
const isSoftDeleted = ref(false);
const liffLoaded = ref(false);
const liffError = ref<string | null>(null);
const lineSessionSet = ref(false);

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

async function initLiff() {
  if (liffLoaded.value) return;
  try {
    // ✅ Save flag BEFORE cleaning URL
    const hasLiffCallback = window.location.search.includes('liffClientId');

    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
    liffLoaded.value = true;

    // Clean URL after saving the flag
    if (hasLiffCallback) {
      window.history.replaceState({}, document.title, window.location.pathname + '#/');
    }

    if (liff.isInClient() || hasLiffCallback) {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const idToken = liff.getIDToken();
      if (idToken && !token.value && !lineSessionSet.value) {
        lineSessionSet.value = true;
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ id_token: idToken }),
          }
        );
        const result = await resp.json();
        if (result.token) {
          await supabase.auth.setSession({
            access_token: result.token,
            refresh_token: result.refresh_token,
          });
          // ✅ Wait for onAuthStateChange to actually set token
          await new Promise<void>((resolve) => {
            if (token.value) { resolve(); return; }
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              if (session) {
                subscription.unsubscribe();
                resolve();
              }
            });
            setTimeout(resolve, 3000);
          });
        } else {
          lineSessionSet.value = false;
        }
      }
    }
  } catch (e: any) {
    liffError.value = e.message || 'LIFF initialization failed';
    liffLoaded.value = false;
  }
}

export const liffInitPromise = initLiff();

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
      nonce:crypto.randomUUID(),
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

  // ✅ Clear LIFF session if logged in via LINE
  if (liffLoaded.value && liff.isLoggedIn()) {
    liff.logout(); // this reloads the page automatically
    return; // ← stop here, liff.logout() handles reload
  }

  token.value = null;
  user.value = null;
  isSoftDeleted.value = false;
  lineSessionSet.value = false;
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