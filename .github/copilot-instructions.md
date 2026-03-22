# GitHub Copilot Instruction

## Project Overview
Achya is a Japanese lunch box pre-order system with two primary interfaces:
1. **Customer App**: A mobile-first PWA for customers to browse menus, place orders, and track their purchases.
2. **Admin App**: A role-based admin panel for managing orders, menus, users, and deliveries.

## Architecture
- **Monorepo**: Yarn workspaces with shared configurations.
- **Apps**:
  - `apps/customer`: Customer-facing PWA.
  - `apps/admin`: Admin panel PWA.
- **Tech Stack**:
  - Vue 3, Vite 7, TypeScript 5.8, Tailwind CSS 3.
  - Supabase for database (planned).
  - Yarn 4.9.1 for package management.

## Admin App Features
1. **Login**:
   - Role-based login for staff, managers, and delivery personnel.

2. **Orders**:
   - View, search, filter, and sort orders.
   - Update order statuses (e.g., preparing, ready, delivered).
   - Accessible to all roles.

3. **Menu Management**:
   - Add, edit, and delete menu items.
   - Upload images, set prices, and categorize items.
   - Accessible to managers.

4. **Delivery**:
   - Manage delivery orders with driver assignment and tracking.
   - Accessible to managers and delivery personnel.

5. **User Management**:
   - Add, edit, and remove user accounts.
   - Assign roles (e.g., staff, manager, delivery).
   - Accessible to managers.

6. **Settings**:
   - Update restaurant info (name, address, contact details).
   - Manage promotional banners.
   - Configure printer settings for auto-printing receipts.

## Customer App Features
1. **Menu Browsing**:
   - Mobile-first design with category navigation.

2. **Order Tracking**:
   - User-friendly order IDs for tracking.

3. **Cart**:
   - Comprehensive cart with item customizations.

4. **Customer Info**:
   - Persistent customer data for reordering.

5. **Internationalization**:
   - UI text system ready for multiple languages.

6. **Business Hours Validation**:
   - Ensure orders align with restaurant hours.

7. **Future Enhancements**:
   - oAUth using google and LINE. 
   - Paypay payment integretion

## Development Guidelines
- **State Management**:
  - Use `ref` and `computed` for local state.
  - Plan to integrate Supabase for backend persistence.
- **Component Structure**:
  - Use Vue 3 Composition API with `<script setup>`.
  - TypeScript for type safety.
  - Tailwind CSS for responsive styling.
  - Centralized UI text constants for i18n.

Current TODO list can be found in [.github/.plan/todo.md](./.github/.plan/todo.md).