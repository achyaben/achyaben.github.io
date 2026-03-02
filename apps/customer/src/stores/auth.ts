import { ref, computed } from 'vue';
import { supabase } from '@app/supabase';

const token = ref<string | null>(null);
const user = ref<any>(null);
const isSoftDeleted = ref(false);

// Initialize and listen to auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    // 1. Set values immediately so UI stays responsive
    token.value = session.access_token;
    user.value = {
      ...session.user,
      picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
      name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
    };

    // 2. Perform soft-delete check asynchronously without blocking
    checkSoftDelete(session.user.id);
  } else {
    token.value = null;
    user.value = null;
    isSoftDeleted.value = false;
  }
});

async function checkSoftDelete(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('id', userId)
      .single();

    if (profile?.deleted_at) {
      console.warn('[Auth] User account is soft-deleted.');
      isSoftDeleted.value = true;
    } else {
      isSoftDeleted.value = false;
    }
  } catch (e) {
    console.error('[Auth] Error checking soft-delete status:', e);
  }
}

export const useAuthStore = () => {
  const isAuthenticated = computed(() => !!token.value);

  async function loginWithGoogle(credential: string) {
    const { data: _data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });
    if (error) {
      console.error('Google login failed:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
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
    signInAnonymously,
    refreshSession,
    logout,
  };
};
