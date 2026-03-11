<template>
  <div class="flex h-screen">
    <!-- Navigation Container -->
    <div :class="isCollapsed ? 'w-16' : 'w-64'" class="flex flex-col" style="
        background-color: var(--color-nav-bg);
        color: #000;
        transition: all 0.3s;
        overflow: hidden;
      ">
      <!-- Header Section -->
      <div class="flex items-center justify-between p-4" style="background-color: var(--color-nav-bg)">
        <button @click="toggleCollapse" class="text-black text-xl">
          <span>☰</span>
        </button>
        <img src="/assets/achyaben-logo.svg" alt="App Logo" class="h-8 w-8 rounded-lg" />
        <span v-if="!isCollapsed" class="text-lg font-bold">Admin Panel</span>
      </div>

      <!-- Navigation Section -->
      <nav class="flex-1 overflow-y-auto">
        <ul class="space-y-1">
          <li v-for="item in filteredMenu" :key="item.name">
            <template v-if="item.external">
              <a :href="item.path" target="_blank"
                class="flex items-center px-4 py-3 hover:bg-black hover:bg-opacity-10 transition-colors"
                active-class="bg-black bg-opacity-20">
                <component :is="item.icon" class="w-6 h-6 flex-shrink-0" />
                <span v-if="!isCollapsed" class="ml-3 whitespace-nowrap">{{ item.name }}</span>
              </a>
            </template>
            <template v-else>
              <router-link :to="item.path"
                class="flex items-center px-4 py-3 hover:bg-black hover:bg-opacity-10 transition-colors"
                active-class="bg-black bg-opacity-20">
                <component :is="item.icon" class="w-6 h-6 flex-shrink-0" />
                <span v-if="!isCollapsed" class="ml-3 whitespace-nowrap">{{ item.name }}</span>
              </router-link>
            </template>
          </li>
        </ul>
      </nav>

      <!-- Mobile Collapsible Menu -->
      <div v-if="isCollapsed" class="absolute top-0 left-0 w-full h-full bg-white z-50 md:hidden">
        <nav>
          <ul class="space-y-2">
            <li v-for="item in filteredMenu" :key="item.name" class="px-4 py-2">
              <template v-if="item.external">
                <a :href="item.path" target="_blank"
                  class="flex items-center space-x-2 hover:bg-yellow-200 p-2 rounded">
                  <component :is="item.icon" class="w-6 h-6" />
                  <span>{{ item.name }}</span>
                </a>
              </template>
              <template v-else>
                <router-link :to="item.path" class="flex items-center space-x-2 hover:bg-yellow-200 p-2 rounded">
                  <component :is="item.icon" class="w-6 h-6" />
                  <span>{{ item.name }}</span>
                </router-link>
              </template>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  TruckIcon,
  UserIcon,
  ChartBarIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline';
import { USER_ROLES } from '../constants/auth';

export default {
  props: {
    userRole: {
      type: String,
      required: true,
    },
  },
  emits: ['toggle-collapse'], // Declare the emit
  data() {
    return {
      isCollapsed: false,
      isPhone: window.innerWidth <= 640, // Tailwind's sm breakpoint
      menu: [
        {
          name: 'Orders',
          path: '/orders',
          icon: HomeIcon,
          roles: [USER_ROLES.MANAGER, USER_ROLES.STAFF, USER_ROLES.DRIVER],
        },
        {
          name: 'Menu Management',
          path: '/menu-management',
          icon: ClipboardDocumentListIcon,
          roles: [USER_ROLES.MANAGER],
        },
        {
          name: 'User Management',
          path: '/user-management',
          icon: UserGroupIcon,
          roles: [USER_ROLES.MANAGER],
        },
        { name: 'Settings', path: '/settings', icon: Cog6ToothIcon, roles: [USER_ROLES.MANAGER] },
        {
          name: 'Delivery',
          path: '/delivery',
          icon: TruckIcon,
          roles: [USER_ROLES.MANAGER, USER_ROLES.DRIVER],
        },
        {
          name: 'Account',
          path: '/account',
          icon: UserIcon,
          roles: [USER_ROLES.MANAGER, USER_ROLES.STAFF, USER_ROLES.DRIVER],
        },
        {
          name: 'Order Summary',
          path: '/order-summary',
          icon: ChartBarIcon,
          roles: [USER_ROLES.MANAGER],
        },
        {
          name: 'Brand Guide',
          path: '/brand-guide.html',
          icon: BookOpenIcon,
          roles: [USER_ROLES.MANAGER],
          external: true,
        },
      ],
    };
  },
  computed: {
    filteredMenu() {
      const role = this.userRole === 'admin' ? USER_ROLES.MANAGER : this.userRole;
      return this.menu.filter((item) => item.roles.includes(role));
    },
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      // Emit the new collapse state to parent
      this.$emit('toggle-collapse', this.isCollapsed);
    },
    handleResize() {
      this.isPhone = window.innerWidth <= 640;
      if (this.isPhone) {
        this.isCollapsed = true; // Always start fully collapsed on mobile
        // Emit the collapse state on resize too
        this.$emit('toggle-collapse', this.isCollapsed);
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // Initialize on mount
    // Emit initial state
    this.$emit('toggle-collapse', this.isCollapsed);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>
