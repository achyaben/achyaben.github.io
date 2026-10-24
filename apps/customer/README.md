# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Local HTTPS for LINE login

LINE's dev LIFF endpoint uses `https://localhost:5173/`. New developers must generate and trust their own local development certificate; certificates and private keys are not committed.

Run these commands from the repository root on macOS:

```sh
brew install mkcert
mkcert -install
mkdir -p apps/customer/.certs
mkcert -key-file apps/customer/.certs/localhost-key.pem -cert-file apps/customer/.certs/localhost.pem localhost 127.0.0.1 ::1
yarn workspace customer dev --config vite.https.config.ts
```

Skip the installation steps if mkcert and its local certificate authority are already installed. `mkcert -install` adds the development certificate authority to your Mac's trust store. Keep its private key private; each developer should generate their own certificates.

Open `https://localhost:5173/` on your Mac and confirm it loads without a certificate warning before starting LINE login. Use the dev LIFF ID and local Supabase URL/key in the ignored `apps/customer/.env.development.local` file.

### Renew an expired certificate

Check the certificate's validity dates:

```sh
openssl x509 -in apps/customer/.certs/localhost.pem -noout -dates
```

Stop Vite, then regenerate the certificate at the same paths and restart:

```sh
mkcert -key-file apps/customer/.certs/localhost-key.pem -cert-file apps/customer/.certs/localhost.pem localhost 127.0.0.1 ::1
yarn workspace customer dev --config vite.https.config.ts
```

If the certificate is untrusted rather than expired, run `mkcert -install` on that developer's Mac and restart the browser. The `.certs/` directory is ignored by Git. Do not commit or copy another developer's private keys.

See [LOCAL_HTTPS.md](LOCAL_HTTPS.md) for the complete setup and troubleshooting notes.
