<template>
  <div v-if="user.role === 'manager'" class="text-left p-4 mb-4">
    <h1 class="text-xl font-bold mb-6 text-left">{{ UI_TEXTS.account.manageOtherUsers }}</h1>
    <router-link to="/user-management" class="underline text-red-500">{{
      UI_TEXTS.account.goToUserManagement
    }}</router-link>
  </div>
  <div class="account-view p-4 bg-white shadow-md rounded-lg max-w-md mx-auto relative mt-8">
    <br />
    <h1 class="text-2xl font-bold mb-6 text-left">{{ UI_TEXTS.account.title }}</h1>
    <button
      v-if="!isEditing"
      @click="startEditing"
      class="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {{ UI_TEXTS.account.editingText }}
    </button>
    <h2 v-if="isEditing" class="text-lg font-semibold text-center text-blue-500 mt-2">
      {{ UI_TEXTS.account.editingText }}
    </h2>
    <div class="user-info mb-6">
      <div class="flex items-center justify-between">
        <label class="block mb-2 font-semibold">{{ UI_TEXTS.account.userInfo.name }}</label>
      </div>
      <p v-if="!isEditing" class="w-full px-4 py-2 border rounded">{{ user.name }}</p>
      <input
        v-else
        v-model="editedUser.name"
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="flex items-center justify-between mt-4">
        <label class="block mb-2 font-semibold">{{ UI_TEXTS.account.userInfo.email }}</label>
      </div>
      <p v-if="!isEditing" class="w-full px-4 py-2 border rounded">{{ user.email }}</p>
      <input
        v-else
        v-model="editedUser.email"
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p class="mt-4">
        <strong>{{ UI_TEXTS.account.userInfo.role }}:</strong> {{ user.role }}
      </p>
    </div>
    <div class="flex justify-end">
      <button
        v-if="isEditing"
        @click="confirmUpdate"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {{ UI_TEXTS.account.updateButton }}
      </button>
      <button
        v-if="isEditing"
        @click="cancelEditing"
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        {{ UI_TEXTS.account.cancelButton }}
      </button>
      <button
        v-if="!isEditing"
        @click="logout"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        {{ UI_TEXTS.account.logoutButton }}
      </button>
    </div>
    <ConfirmDialog
      v-if="showConfirmDialog"
      :isOpen="showConfirmDialog"
      :title="UI_TEXTS.account.confirmUpdateTitle"
      :message="UI_TEXTS.account.confirmUpdateMessage"
      @cancel="hideConfirmDialog"
      @confirm="updateUser"
    />
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { UI_TEXTS } from '../constants/ui-texts';
import ConfirmDialog from '../components/ConfirmDialog.vue';

export default {
  components: {
    ConfirmDialog,
  },
  data() {
    const authStore = useAuthStore();
    return {
      user: { ...authStore.user } || { name: 'Guest', email: 'N/A', role: 'guest' },
      editedUser: {},
      isEditing: false,
      showConfirmDialog: false,
      UI_TEXTS,
    };
  },
  methods: {
    startEditing() {
      this.isEditing = true;
      this.editedUser = { ...this.user };
    },
    cancelEditing() {
      this.isEditing = false;
      this.editedUser = {};
    },
    confirmUpdate() {
      this.showConfirmDialog = true;
    },
    hideConfirmDialog() {
      this.showConfirmDialog = false;
    },
    updateUser() {
      const authStore = useAuthStore();
      authStore.updateUser(this.editedUser);
      this.user = { ...this.editedUser };
      this.isEditing = false;
      this.showConfirmDialog = false;
      this.$emit('update-success');
    },
    logout() {
      const authStore = useAuthStore();
      authStore.logout();
      this.$router.push('/');
    },
  },
};
</script>
