import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from './stores/auth';
import OrdersView from './views/OrdersView.vue';
import BaseLayout from './layouts/BaseLayout.vue';
import MenuManagementView from './views/MenuManagementView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/orders' },
  {
    path: '/orders',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: OrdersView,
        meta: { requiresAuth: true, roles: ['admin', 'manager', 'staff', 'driver'] },
      },
    ],
  },
  {
    path: '/menu-management',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: MenuManagementView,
        meta: { requiresAuth: true, roles: ['admin', 'manager'] },
      },
    ],
  },
  {
    path: '/user-management',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: () => import('./views/UserManagementView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'manager'] },
      },
    ],
  },
  {
    path: '/delivery',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: () => import('./views/DeliveryView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'driver', 'manager'] },
      },
    ],
  },
  {
    path: '/settings',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: () => import('./views/SettingsView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'manager'] },
      },
    ],
  },
  {
    path: '/account',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: () => import('./views/AccountView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'manager', 'staff', 'driver'] },
      },
    ],
  },
  {
    path: '/order-summary',
    component: BaseLayout,
    children: [
      {
        path: '',
        component: () => import('./views/OrderSummaryView.vue'),
        meta: { requiresAuth: true, roles: ['admin', 'manager'] },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('./views/LoginView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  await authStore.refreshUser();

  const isLoggedIn = !!authStore.user;

  if (to.path === '/login') {
    if (isLoggedIn) {
      next('/orders');
    } else {
      next();
    }
    return;
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = authStore.user?.role;
    if (!userRole || !to.meta.roles.includes(userRole)) {
      console.warn(`Access denied for role: ${userRole}. Required: ${to.meta.roles}`);
      next(isLoggedIn ? '/orders' : '/login');
      return;
    }
  }

  next();
});

export default router;
