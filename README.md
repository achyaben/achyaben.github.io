# 炭火焼鳥＆インドカレーあちゃー (Achyaben Web System)

Welcome to the official web ordering platform and landing page for **炭火焼鳥＆インドカレーあちゃー** (Charcoal Grilled Yakitori & Indian Curry Achya).

This repository contains the source code for our online presence:

- **Landing Page**: A static HTML/Tailwind landing page built directly into the repository root (`index.html`), featuring dynamic EN/JA translations, theme toggling, and integrated Google Calendar/Maps.
- **Ordering System**: A sophisticated Vue 3 POS/Customer ordering PWA, actively powering the `./customer` and `./admin` directories.

Both the landing page and the ordering PWA are automatically built and deployed via GitHub Actions directly to our GitHub Pages domain.

---

## Technical Foundation: やきべん (Yakiben)

Our digital ordering system leverages the powerful **Yakiben** architecture.

https://github.com/Ashok314/yakiben

Modern Japanese lunch box pre-order system built with Vue 3 and TypeScript.

## Features

### Customer App

- 🍱 Beautiful, mobile-first menu browsing
- 🛒 Smart cart with customizations and quantity management
- 📝 Order tracking with user-friendly IDs
- 🖨️ Advanced printing support for orders and receipts
- 💾 Customer info persistence and quick reordering
- 🕒 Smart pickup time validation with business hours
- 🌐 Internationalization-ready UI text system
- 📱 PWA-ready for mobile installation

### Admin App (Coming Soon)

- 📊 Order management dashboard
- 🗂️ Menu and inventory control
- 👥 Role-based access control
- 🚚 Delivery management

## Monorepo Structure

- `apps/customer`: Customer-facing Vue 3 + Vite + TS + Tailwind + PWA app
- `apps/admin`: Admin panel (Vue 3 + Vite + TS + Tailwind + PWA)

## Development

- Install dependencies: `yarn install`
- Run customer app: `yarn workspace customer dev`
- Run admin app: `yarn workspace admin dev`
- Regenerate Supabase types: `yarn gen:types`

> **`libs/supabase/types.ts` is auto-generated** — never edit it manually. After adding a migration (new RPC, table, or view), run `yarn gen:types` to sync TypeScript types with the live schema. This runs automatically in the pre-commit hook so committed types are always in sync with the latest schema.

## Routing for GitHub Pages

- Both apps use Vue Router in hash mode (`/#/route`) for static hosting compatibility.
- Vite `base` is set to `/customer/` and `/admin/` for correct asset paths.

## Deployment

- Both apps are built and deployed to GitHub Pages using GitHub Actions.
- See `.github/workflows/gh-pages.yml` for the deploy workflow.
- After deployment:
  - Customer app: `https://<username>.github.io/<repo>/customer/`
  - Admin app: `https://<username>.github.io/<repo>/admin/`

## Architecture

### PWA Support

- 📱 Installable on mobile devices
- 🔄 Offline support and asset caching
- 🚀 Optimized for performance

### Configuration

- 🏢 Centralized restaurant info configuration
- 🌐 Hierarchical UI text system for i18n
- ⚙️ Business hours and validation rules
- 🎨 Shared design tokens and Tailwind theme

### Development Tools

- 🛠️ ESLint, Prettier for code quality
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🔄 Husky and lint-staged for git hooks
- 🧪 Mock API layer for development

### Environment Variables

- Place `.env` files in each app for secrets (see `.env.example` in each app).

## Project Structure

```
yakiben/
├── apps/
│   ├── customer/           # Customer-facing app
│   │   ├── src/
│   │   │   ├── config/    # App configuration
│   │   │   ├── constants/ # UI text and constants
│   │   │   ├── data/     # Mock API and data
│   │   │   ├── stores/   # State management
│   │   │   ├── types/    # TypeScript types
│   │   │   └── views/    # Vue components
│   │   └── public/       # Static assets
│   └── admin/            # Admin panel (WIP)
└── shared/              # Shared configurations
```

---

For more details, see the code and workflow files in this repo.

## License

This project is released under a **strict custom license**.  
**No use of the code is allowed** — including personal or internal business use — without explicit written permission.

See [`LICENSE-RESTRICTED.txt`](./LICENSE-RESTRICTED.txt) for full details.
