import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '../types/types';
import { USER_ROLES } from '../constants/auth';
import { supabase } from '@app/supabase';

function isAdminRole(role: unknown): role is UserRole {
  return role === USER_ROLES.MANAGER || role === USER_ROLES.STAFF || role === USER_ROLES.DRIVER;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isInitialLoading = ref(true);
  let revision = 0;
  let profileCheck = Promise.resolve();

  function setUser(value: User | null) {
    user.value = value;
    isAuthenticated.value = value !== null;
    if (value) localStorage.setItem('user', JSON.stringify(value));
    else localStorage.removeItem('user');
  }

  function checkSession(session: Session | null, defer = false) {
    const request = ++revision;
    setUser(null);
    isInitialLoading.value = session !== null;
    const start = defer
      ? new Promise<void>((resolve) => setTimeout(resolve, 0))
      : Promise.resolve();
    profileCheck = start
      .then(async () => {
        if (!session || request !== revision) return;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, f_name, l_name, deleted_at')
            .eq('id', session.user.id)
            .abortSignal(controller.signal)
            .single();
          if (
            request !== revision ||
            error ||
            !profile ||
            profile.deleted_at ||
            !isAdminRole(profile.role)
          )
            return;
          const firstName = profile.f_name || '';
          const lastName = profile.l_name || '';
          const name = firstName === lastName ? firstName : `${firstName} ${lastName}`.trim();
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name:
              name ||
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              'Admin User',
            avatar_url:
              session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider || 'google',
            role: profile.role,
          });
        } catch {
          if (request === revision) setUser(null);
        } finally {
          clearTimeout(timeout);
        }
      })
      .finally(() => {
        if (request === revision) isInitialLoading.value = false;
      });
    return profileCheck;
  }

  async function waitForProfile() {
    let pending;
    do {
      pending = profileCheck;
      await pending;
    } while (pending !== profileCheck);
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    // Supabase auth callbacks run under its session lock; query after it is released.
    void checkSession(session, true);
  });

  async function refreshUser() {
    const request = revision;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (request === revision) await checkSession(error ? null : data.session);
      await waitForProfile();
    } catch {
      if (request === revision) await checkSession(null);
    }
  }

  async function signIn(authenticate: () => Promise<{ error: { message: string } | null }>) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const { error } = await Promise.race([
        authenticate(),
        new Promise<never>((_resolve, reject) => {
          timeout = setTimeout(
            () => reject(new Error('Sign-in timed out. Please try again.')),
            10000
          );
        }),
      ]);
      if (error) return { success: false, message: error.message };
      await refreshUser();
      if (!user.value) {
        await supabase.auth.signOut();
        return {
          success: false,
          message: 'Access denied. Your account does not have admin privileges.',
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed.',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  const loginWithGoogle = (credential: string) =>
    signIn(() =>
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      })
    );

  const login = (email: string, password: string) =>
    signIn(() => supabase.auth.signInWithPassword({ email, password }));

  const logout = async () => {
    await checkSession(null);
    await supabase.auth.signOut();
  };

  const updateUser = async (updatedUser: User) => {
    const currentUser = user.value;
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        f_name: updatedUser.name.split(' ')[0],
        l_name: updatedUser.name.split(' ').slice(1).join(' '),
      })
      .eq('id', currentUser.id);
    if (!error) await refreshUser();
  };

  return {
    isInitialLoading,
    user,
    isAuthenticated,
    refreshUser,
    loginWithGoogle,
    login,
    logout,
    updateUser,
  };
});
