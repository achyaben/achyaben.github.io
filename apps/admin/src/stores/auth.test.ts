import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useAuthStore } from './auth';

const mock = vi.hoisted(() => ({
  listener: null as ((event: AuthChangeEvent, session: Session | null) => void) | null,
  single: vi.fn(),
  eq: vi.fn(),
  update: vi.fn(),
  getSession: vi.fn(),
  signInWithIdToken: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('@app/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: mock.eq }),
      update: mock.update,
    }),
    auth: {
      onAuthStateChange: (listener: typeof mock.listener) => {
        mock.listener = listener;
      },
      getSession: mock.getSession,
      signInWithIdToken: mock.signInWithIdToken,
      signInWithPassword: mock.signInWithPassword,
      signOut: mock.signOut,
    },
  },
}));

const session: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-1',
    aud: 'authenticated',
    created_at: '2026-10-25T00:00:00Z',
    email: 'test@example.invalid',
    user_metadata: { role: 'manager' },
    app_metadata: {},
  },
};
const profile = { role: 'manager', f_name: 'Test', l_name: 'Manager', deleted_at: null };

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.stubGlobal('localStorage', { setItem: vi.fn(), removeItem: vi.fn() });
  setActivePinia(createPinia());
  mock.eq.mockReturnValue({ abortSignal: () => ({ single: mock.single }) });
  mock.single.mockResolvedValue({ data: profile, error: null });
  mock.getSession.mockResolvedValue({ data: { session }, error: null });
  mock.signInWithIdToken.mockResolvedValue({ error: null });
  mock.signInWithPassword.mockResolvedValue({ error: null });
  mock.signOut.mockResolvedValue({ error: null });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function restore() {
  const store = useAuthStore();
  mock.listener?.('INITIAL_SESSION', session);
  await vi.runAllTimersAsync();
  return store;
}

describe('admin profile authorization', () => {
  it.each(['manager', 'staff', 'driver'])(
    'restores the protected %s profile role',
    async (role) => {
      mock.single.mockResolvedValue({ data: { ...profile, role }, error: null });
      const store = await restore();
      expect(store.user?.role).toBe(role);
      expect(store.isAuthenticated).toBe(true);
    }
  );

  it.each([
    { ...profile, role: 'customer' },
    { ...profile, role: undefined },
    { ...profile, role: 'admin' },
    { ...profile, deleted_at: '2026-10-25T00:00:00Z' },
    null,
  ])(
    'denies missing, deleted, or unauthorized profiles despite manager metadata: %j',
    async (data) => {
      mock.single.mockResolvedValue({ data, error: null });
      const store = await restore();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isInitialLoading).toBe(false);
    }
  );

  it('denies profile query errors', async () => {
    mock.single.mockResolvedValue({ data: profile, error: new Error('offline') });
    expect((await restore()).user).toBeNull();
  });

  it('defers profile queries outside the auth callback and grants nothing while pending', async () => {
    const store = useAuthStore();
    mock.listener?.('SIGNED_IN', session);
    expect(mock.single).not.toHaveBeenCalled();
    expect(store.user).toBeNull();
    await vi.runAllTimersAsync();
    expect(store.user?.role).toBe('manager');
  });

  it('does not restore access from a query that completes after sign-out', async () => {
    let resolve!: (value: unknown) => void;
    mock.single.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    const store = useAuthStore();
    mock.listener?.('SIGNED_IN', session);
    await vi.advanceTimersByTimeAsync(0);
    mock.listener?.('SIGNED_OUT', null);
    resolve({ data: profile, error: null });
    await vi.runAllTimersAsync();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it.each(['google', 'password'])(
    'applies the same profile check to %s login',
    async (provider) => {
      const store = useAuthStore();
      mock.single.mockResolvedValue({ data: { ...profile, role: 'customer' }, error: null });
      const result =
        provider === 'google'
          ? await store.loginWithGoogle('credential')
          : await store.login('test@example.invalid', 'password');
      expect(result.success).toBe(false);
      expect(store.user).toBeNull();
    }
  );

  it('rechecks the role and revokes cached access after demotion', async () => {
    const store = await restore();
    mock.single.mockResolvedValue({ data: { ...profile, role: 'customer' }, error: null });
    await store.refreshUser();
    expect(store.user).toBeNull();
  });

  it.each(['google', 'password'])(
    'allows a verified manager through %s login',
    async (provider) => {
      const store = useAuthStore();
      const result =
        provider === 'google'
          ? await store.loginWithGoogle('credential')
          : await store.login('test@example.invalid', 'password');
      expect(result.success).toBe(true);
      expect(store.user?.role).toBe('manager');
    }
  );

  it('clears prior authorization when the session cannot be read', async () => {
    const store = await restore();
    mock.getSession.mockRejectedValue(new Error('session unavailable'));
    await store.refreshUser();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('aborts a stalled profile check without granting access', async () => {
    mock.eq.mockReturnValue({
      abortSignal: (signal: AbortSignal) => ({
        single: () =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      }),
    });
    const store = useAuthStore();
    mock.listener?.('INITIAL_SESSION', session);
    await vi.runAllTimersAsync();
    expect(store.isInitialLoading).toBe(false);
    expect(store.user).toBeNull();
  });

  it('ignores supplied user IDs and roles when updating account details', async () => {
    const store = await restore();
    mock.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    await store.updateUser({
      ...store.user!,
      id: 'another-user',
      role: 'customer',
      name: 'New Name',
    });
    expect(mock.update.mock.results[0].value.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(store.user?.id).toBe('user-1');
    expect(store.user?.role).toBe('manager');
  });
});
