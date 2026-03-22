<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ UI_TEXTS.userManagement.title }}</h1>
    <p class="mb-4">{{ UI_TEXTS.userManagement.description }}</p>

    <div class="mb-6 flex space-x-4 border-b">
      <button
        @click="activeTab = USER_MANAGEMENT_TABS.STAFF"
        :class="
          activeTab === USER_MANAGEMENT_TABS.STAFF
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500'
        "
        class="pb-2 font-medium"
      >
        Admin Staff
      </button>
      <button
        @click="activeTab = USER_MANAGEMENT_TABS.CUSTOMERS"
        :class="
          activeTab === USER_MANAGEMENT_TABS.CUSTOMERS
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500'
        "
        class="pb-2 font-medium"
      >
        Customers
      </button>
    </div>

    <table
      class="table-auto w-full border-collapse border border-gray-300 shadow-sm rounded-lg overflow-hidden"
    >
      <thead>
        <tr class="bg-gray-50 text-left text-sm font-semibold text-gray-700">
          <th class="px-6 py-3 border-b">{{ UI_TEXTS.userManagement.tableHeaders.name }}</th>
          <th class="px-6 py-3 border-b">Login</th>
          <th class="px-6 py-3 border-b">{{ UI_TEXTS.userManagement.tableHeaders.email }}</th>
          <th class="px-6 py-3 border-b">{{ UI_TEXTS.userManagement.tableHeaders.role }}</th>
          <th class="px-6 py-3 border-b">{{ UI_TEXTS.userManagement.tableHeaders.actions }}</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 text-sm font-medium text-gray-900">
            <div class="flex items-center">
              <img v-if="user.avatar_url" :src="user.avatar_url" class="w-8 h-8 rounded-full mr-2 border border-gray-100" />
              <div v-else class="w-8 h-8 rounded-full bg-gray-100 mr-2 flex items-center justify-center text-xs text-gray-400">?</div>
              {{ user.name }}
            </div>
          </td>
          <td class="px-6 py-4 text-sm font-medium text-gray-900">
            <div class="flex items-center">
              <img v-if="user.provider === 'line'" src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" class="w-5 h-5 mr-1" />
              <img v-else-if="user.provider === 'google'" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="w-5 h-5 mr-1" />
              <span class="text-xs text-gray-500 capitalize">{{ user.provider || 'Other' }}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-gray-600">{{ user.email || '(No Email)' }}</td>
          <td class="px-6 py-4 text-sm">
            <span
              :class="getRoleBadgeClass(user.role)"
              class="px-2 py-1 rounded-full text-xs font-semibold"
            >
              {{ user.role }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-4" @click="openEditModal(user)">
              {{ UI_TEXTS.userManagement.actions.edit }}
            </button>
            <button
              class="text-red-600 hover:text-red-900 font-medium"
              @click="openDeleteDialog(user.id)"
            >
              {{ UI_TEXTS.userManagement.actions.delete }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">{{ UI_TEXTS.userManagement.modals.editUser.title }}</h2>
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">User</label>
            <div class="mt-1 p-2 bg-gray-50 rounded border text-sm text-gray-600 flex items-center">
              <img v-if="currentUser.provider === 'line'" src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" class="w-4 h-4 mr-2" />
              <img v-else-if="currentUser.provider === 'google'" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="w-4 h-4 mr-2" />
              {{ currentUser.name }} ({{ currentUser.email || 'LINE' }})
            </div>
          </div>
          <div class="mb-4">
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select
              v-model="currentUser.role"
              id="role"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <optgroup label="Staff Roles">
                <option :value="USER_ROLES.MANAGER">Manager</option>
                <option :value="USER_ROLES.STAFF">Staff</option>
                <option :value="USER_ROLES.DRIVER">Driver</option>
              </optgroup>
              <optgroup label="Customer Roles">
                <option :value="USER_ROLES.CUSTOMER">Customer</option>
              </optgroup>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="px-4 py-2 bg-gray-300 rounded" @click="closeEditModal">
              {{ UI_TEXTS.userManagement.modals.editUser.buttons.cancel }}
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
              {{ UI_TEXTS.userManagement.modals.editUser.buttons.save }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      v-if="isDeleteDialogOpen"
      :isOpen="isDeleteDialogOpen"
      :title="UI_TEXTS.userManagement.modals.deleteUser.title"
      :message="UI_TEXTS.userManagement.modals.deleteUser.message"
      @cancel="closeDeleteDialog"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import type { User, UserRole } from '../types/types';
import { usersApi } from '../api/users';
import { UI_TEXTS } from '../constants/ui-texts';
import { USER_ROLES, USER_MANAGEMENT_TABS } from '../constants/auth';
import type { UserManagementTab } from '../constants/auth';

const users = ref<User[]>([]);
const isEditModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const currentUser = ref<User>({ id: '', name: '', email: '', role: USER_ROLES.STAFF, provider: 'google' });
const deleteUserId = ref<string | null>(null);
const activeTab = ref<UserManagementTab>(USER_MANAGEMENT_TABS.STAFF);

const filteredUsers = computed(() => {
  if (activeTab.value === USER_MANAGEMENT_TABS.STAFF) {
    return users.value.filter((u) =>
      ([USER_ROLES.MANAGER, USER_ROLES.STAFF, USER_ROLES.DRIVER] as UserRole[]).includes(u.role)
    );
  }
  return users.value.filter((u) => u.role === USER_ROLES.CUSTOMER);
});

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case USER_ROLES.MANAGER:
      return 'bg-blue-100 text-blue-800';
    case USER_ROLES.STAFF:
      return 'bg-green-100 text-green-800';
    case USER_ROLES.DRIVER:
      return 'bg-orange-100 text-orange-800';
    case USER_ROLES.CUSTOMER:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const loadUsers = async () => {
  try {
    users.value = await usersApi.getUsers();
  } catch (err) {
    console.error('Failed to load users:', err);
  }
};

onMounted(loadUsers);

const openEditModal = (user: User) => {
  currentUser.value = { ...user };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentUser.value = { id: '', name: '', email: '', role: USER_ROLES.STAFF, provider: 'google' };
};

const openDeleteDialog = (id: string) => {
  deleteUserId.value = id;
  isDeleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false;
  deleteUserId.value = null;
};

const deleteUser = async () => {
  if (deleteUserId.value !== null) {
    try {
      const success = await usersApi.deleteUser(deleteUserId.value);
      if (success) {
        await loadUsers();
        closeDeleteDialog();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }
};

const saveUser = async () => {
  try {
    const success = await usersApi.updateUserRole(currentUser.value.id, currentUser.value.role);
    if (success) {
      await loadUsers();
      closeEditModal();
    }
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};
</script>
