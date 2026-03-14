# LINE Login (LIFF) Integration Plan

The goal is to authenticate users via LINE when they are using the LINE in-app browser (LIFF) and fallback to the existing Google OAuth flow otherwise. Both paths should result in a valid Supabase session.

## User Review Required

> [!IMPORTANT]
> **Supabase Backend Configuration for LINE token exchange**
> I've double checked the latest Supabase specs. Supabase **does not** support LINE as a built-in provider, and configuring a "Custom OIDC Provider" natively via the dashboard is an Enterprise-only feature in Supabase.
> 
> Therefore, **an Edge Function IS absolutely needed** and is the fastest, standard way to do this on the free/pro tier. i added small Deno Edge Function in `supabase/functions/line-auth` directory that:
> 1. Receives the LIFF ID Token.
> 2. Verifies it against LINE's official endpoints using your `LINE_CHANNEL_ID`.
> 3. Creates/finds a corresponding Supabase user (via Admin SDK) based on their LINE profile.
> 4. Mints a custom Supabase JWT that the Vue app can use for `supabase.auth.setSession()`.
> 

> i will  provide the `VITE_LIFF_ID` (so we can initialize the SDK) and the `LINE_CHANNEL_ID` (so the Edge Function can verify the token).

---

## Proposed Changes

### `supabase/functions/line-auth` (Added : need to check working )

#### [NEW] `index.ts` (Deno Edge Function)
- Receives the LINE `id_token` in the request body.
- Uses `fetch('https://api.line.me/oauth2/v2.1/verify')` to decode and validate `id_token` securely.
- Uses the `SUPABASE_SERVICE_ROLE_KEY` to query `auth.users` for the LINE identity (using a generated email hook or `user_metadata`).
- Creates the user inside Supabase Auth if they don't exist.
- Signs a custom JWT using the `SUPABASE_JWT_SECRET` for that `uuid`.
- Returns the `{ access_token, user }` back to the frontend to set the session locally.

---

### `apps/customer`

#### [NEW] Dependency
- Add `@line/liff` to `package.json` dependencies. -> added 

Do the following 

#### [MODIFY] `apps/customer/src/stores/auth.ts`
- **LIFF Initialization**: Import and call `liff.init({ liffId: ... })` at the start or in a dedicated `initAuth` function.
- **`loginWithLine` function**: Create a function to handle LINE authentication.
  - If `liff.isInClient()` is true, ensure `liff.login()` has fired implicitly or explicitly.
  - Get the token via `liff.getIDToken()`.
  - Pass the token to the newly created Supabase Edge Function (`/functions/v1/line-auth`).
  - Take the returned custom JWT and call `supabase.auth.setSession({ access_token: jwt, refresh_token: null })`.

#### [MODIFY] `apps/customer/src/views/CartView.vue`
- Update the authenticated block checks.
- If `liff.isInClient()` is true and the user is *not* authenticated, display a "LINEでログイン" (Login with LINE) button instead of Google, or auto-fire the login.

#### [MODIFY] `apps/customer/src/components/UserMenu.vue`
- Similar to `CartView.vue`, swap the Google Login button for a LINE Login button (or auto-login) if `liff.isInClient()`.

---

## Verification Plan

### Automated Tests
- N/A - Auth integrations often rely on manual testing or mocked e2e servers.

### Manual Verification
- **Google Login Fallback:** Open the development server in a standard browser (e.g., Chrome/Safari). Verify the Google login button appears and works correctly as before.
- **LIFF Browser simulation:** Run the app inside the LINE developer LIFF playground or specify a URL parameter we can use to mock `liff.isInClient() === true`, and verify the login flow routes through LINE and establishes a session.
