<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ UI_TEXTS.menuManagement.title }}</h1>
    <p class="mb-4">{{ UI_TEXTS.menuManagement.description }}</p>

    <!-- Tabs -->
    <div class="mb-4">
      <div class="flex border-b border-gray-300">
        <button
          v-for="(label, key) in UI_TEXTS.menuManagement.tabs"
          :key="key"
          @click="activeTab = key"
          :class="[
            'px-4 py-2',
            activeTab === key ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500',
          ]"
          class="focus:outline-none"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Menu Items Tab -->
    <div v-if="activeTab === 'items'">
      <table class="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.menuManagement.tableHeaders.name }}
            </th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.menuManagement.tableHeaders.price }}
            </th>
            <th class="border border-gray-300 px-4 py-2">Sort</th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.menuManagement.tableHeaders.description }}
            </th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.menuManagement.tableHeaders.outOfStock }}
            </th>
            <th class="border border-gray-300 px-4 py-2">
              {{ UI_TEXTS.menuManagement.tableHeaders.actions }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="category in categories" :key="category">
            <tr>
              <td colspan="6" class="bg-gray-200 text-gray-700 font-bold px-4 py-2">
                {{ category }}
              </td>
            </tr>
            <tr
              v-for="item in menuItems
                .filter((item) => item.category === category)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))"
              :key="item.id"
            >
              <td class="border border-gray-300 px-4 py-2">{{ item.name }}</td>
              <td class="border border-gray-300 px-4 py-2">{{ item.price }}</td>
              <td class="border border-gray-300 px-4 py-2 text-center">
                {{ item.sort_order || 0 }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                {{ truncateDescription(item.description) }}
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <span v-if="item.outOfStock" class="text-red-500">{{
                  UI_TEXTS.menuManagement.itemStatus.outOfStock
                }}</span>
                <span v-else class="text-green-500">{{
                  UI_TEXTS.menuManagement.itemStatus.available
                }}</span>
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <button class="text-blue-500 hover:underline mr-2" @click="openEditModal(item)">
                  {{ UI_TEXTS.menuManagement.actions.edit }}
                </button>
                <button class="text-red-500 hover:underline" @click="confirmDelete(item.id)">
                  {{ UI_TEXTS.menuManagement.actions.delete }}
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" @click="openAddModal">
        {{ UI_TEXTS.menuManagement.actions.addNewItem }}
      </button>
    </div>

    <!-- Customizations Tab -->
    <div v-if="activeTab === 'customizations'">
      <h2 class="text-xl font-bold mb-4">
        {{ UI_TEXTS.menuManagement.customizations.masterListTitle }}
      </h2>
      <div v-if="allCustomizations.length === 0" class="text-gray-500 italic mb-4">
        {{ UI_TEXTS.menuManagement.customizations.noGroups }}
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="group in allCustomizations"
          :key="group.id"
          class="border p-4 rounded bg-gray-50 relative"
        >
          <div class="absolute top-2 right-2 flex gap-2">
            <button @click="openEditGroupModal(group)" class="text-blue-500 hover:text-blue-700">
              <!-- Edit Icon -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
            <button @click="confirmDeleteGroup(group.id)" class="text-red-500 hover:text-red-700">
              <XMarkIcon class="h-4 w-4" />
            </button>
          </div>
          <h3 class="font-bold text-lg mb-2">{{ group.name }}</h3>
          <div class="text-xs text-gray-500 mb-2">
            <span v-if="group.is_required" class="bg-red-100 text-red-800 px-1 rounded mr-1"
              >Required</span
            >
            <span v-else class="bg-gray-200 text-gray-800 px-1 rounded mr-1">Optional</span>
            <span class="bg-blue-100 text-blue-800 px-1 rounded"
              >Max: {{ group.max_selections }}</span
            >
          </div>
          <ul class="text-sm space-y-1">
            <li v-for="opt in group.options" :key="opt.id" class="flex justify-between">
              <span
                >{{ opt.name }}
                <span
                  v-if="opt.is_default"
                  class="text-xs bg-green-100 text-green-800 px-1 rounded ml-1"
                  >Default</span
                ></span
              >
              <span class="text-gray-600">+¥{{ opt.price_add }}</span>
            </li>
          </ul>
        </div>
      </div>
      <button
        @click="openAddGroupModal"
        class="mt-4 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
      >
        {{ UI_TEXTS.menuManagement.actions.addNewGroup }}
      </button>
    </div>

    <!-- Menu Item Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex z-50"
      @click.self="confirmCloseModal"
    >
      <div class="w-4/5 bg-white p-6 rounded shadow-lg overflow-auto ml-auto">
        <h2 class="text-2xl font-bold mb-4">
          {{
            isEditing
              ? UI_TEXTS.menuManagement.modals.editItem.title
              : UI_TEXTS.menuManagement.modals.addItem.title
          }}
        </h2>
        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.nameLabel
            }}</label>
            <input
              v-model="currentItem.name"
              type="text"
              id="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              required
            />
          </div>
          <div class="mb-4">
            <label for="price" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.priceLabel
            }}</label>
            <input
              v-model="currentItem.price"
              type="number"
              id="price"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              required
            />
          </div>
          <div class="mb-4">
            <label for="category" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.categoryLabel
            }}</label>
            <select
              v-model="currentItem.category"
              id="category"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              required
            >
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
              <option value="add-new">
                {{ UI_TEXTS.menuManagement.modals.form.addNewCategory }}
              </option>
            </select>
            <div v-if="currentItem.category === 'add-new'" class="mt-2">
              <input
                v-model="newCategory"
                type="text"
                :placeholder="UI_TEXTS.menuManagement.modals.form.newCategoryPlaceholder"
                class="border rounded px-2 py-1 w-full"
              />
              <button
                type="button"
                @click="addCategory(newCategory)"
                class="mt-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                {{ UI_TEXTS.menuManagement.modals.form.addCategoryButton }}
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.descriptionLabel
            }}</label>
            <textarea
              v-model="currentItem.description"
              id="description"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="imageUrl" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.imageUrlLabel
            }}</label>
            <input
              v-model="currentItem.imageUrl"
              type="text"
              id="imageUrl"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              required
              @input="handleImageInput"
            />
            <div v-if="currentItem.imageUrl && !imagePreviewError" class="mt-2">
              <img
                :src="getImageUrl(currentItem.imageUrl)"
                alt="Preview"
                class="h-32 w-32 object-cover rounded border"
                @error="imagePreviewError = true"
                @load="imagePreviewError = false"
              />
            </div>
          </div>
          <div class="mb-4">
            <label for="sort_order" class="block text-sm font-medium text-gray-700"
              >Sort Order</label
            >
            <input
              v-model.number="currentItem.sort_order"
              type="number"
              id="sort_order"
              min="0"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div class="mb-4">
            <label for="outOfStock" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.menuManagement.modals.form.outOfStockLabel
            }}</label>
            <input v-model="currentItem.outOfStock" type="checkbox" id="outOfStock" class="mt-1" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{
              UI_TEXTS.menuManagement.modals.form.optionsLabel
            }}</label>
            <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
              <label
                v-for="custom in allCustomizations"
                :key="custom.id"
                class="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  :value="custom"
                  v-model="currentItem.groups"
                  class="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
                <span class="text-sm text-gray-700">{{ custom.name }}</span>
              </label>
            </div>
            <p v-if="allCustomizations.length === 0" class="text-sm text-gray-500 italic">
              {{ UI_TEXTS.menuManagement.modals.form.noCustomizationsFound }}
            </p>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="px-4 py-2 bg-gray-300 rounded" @click="confirmCloseModal">
              {{ UI_TEXTS.menuManagement.modals.form.cancelButton }}
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
              {{ UI_TEXTS.menuManagement.modals.form.saveButton }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Customization Group Modal -->
    <div
      v-if="isGroupModalOpen"
      class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="isGroupModalOpen = false"
    >
      <div class="bg-white p-6 rounded shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">{{ UI_TEXTS.menuManagement.modals.addGroup.title }}</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">{{
            UI_TEXTS.menuManagement.modals.form.groupNameLabel
          }}</label>
          <input
            v-model="newGroup.name"
            type="text"
            class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-primary"
            :placeholder="UI_TEXTS.menuManagement.modals.form.groupNamePlaceholder"
          />
        </div>

        <!-- Constraints -->
        <div class="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Max Selections</label>
            <input
              v-model.number="newGroup.max_selections"
              type="number"
              min="1"
              class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Sort Order</label>
            <input
              v-model.number="newGroup.sort_order"
              type="number"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-primary"
            />
          </div>
          <div class="flex items-end mb-2">
            <label class="flex items-center space-x-2">
              <input
                v-model="newGroup.is_required"
                type="checkbox"
                class="rounded text-primary focus:ring-primary"
              />
              <span class="text-sm font-medium text-gray-700">Required (Min 1)</span>
            </label>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <!-- Column headers -->
          <div class="flex gap-2 mb-2 text-xs font-medium text-gray-600">
            <div class="flex-1">Name</div>
            <div class="w-20 text-center">Price</div>
            <div class="w-16 text-center">Order</div>
            <div class="w-20 text-center">Default</div>
            <div class="w-5"></div>
          </div>
          <div
            v-for="(opt, idx) in newGroup.options"
            :key="idx"
            class="flex gap-2 mb-2 items-center"
            v-show="!opt.delete"
          >
            <input
              v-model="opt.name"
              type="text"
              :placeholder="UI_TEXTS.menuManagement.modals.form.nameLabel"
              class="flex-1 border-gray-300 rounded shadow-sm"
            />
            <input
              v-model.number="opt.price_add"
              type="number"
              :placeholder="UI_TEXTS.menuManagement.modals.form.priceLabel"
              class="w-20 border-gray-300 rounded shadow-sm"
            />
            <input
              v-model.number="opt.sort_order"
              type="number"
              placeholder="Order"
              min="0"
              class="w-16 border-gray-300 rounded shadow-sm"
              title="Sort Order"
            />
            <label class="flex items-center space-x-1 whitespace-nowrap">
              <input
                v-model="opt.is_default"
                type="checkbox"
                class="rounded text-primary focus:ring-primary"
              />
              <span class="text-xs text-gray-500">Default</span>
            </label>
            <button
              @click="opt.id ? (opt.delete = true) : newGroup.options.splice(idx, 1)"
              class="text-red-500"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <button
            @click="
              newGroup.options.push({
                id: undefined,
                name: '',
                price_add: 0,
                is_default: false,
                sort_order: 0,
                delete: false,
              })
            "
            class="text-sm text-blue-500 hover:underline"
          >
            {{ UI_TEXTS.menuManagement.modals.form.addOption }}
          </button>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="isGroupModalOpen = false" class="px-4 py-2 bg-gray-300 rounded">
            {{ UI_TEXTS.menuManagement.modals.form.cancelButton }}
          </button>
          <button @click="saveGroup" class="px-4 py-2 bg-blue-500 text-white rounded">
            {{ UI_TEXTS.menuManagement.modals.form.saveButton }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="isConfirmDialogOpen"
      :isOpen="isConfirmDialogOpen"
      :title="confirmDialogTitle"
      :message="confirmDialogMessage"
      @cancel="closeConfirmDialog"
      @confirm="handleConfirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import type { MenuItem } from '../types/types';
import { menuApi } from '../api/menu';
import { UI_TEXTS } from '../constants/ui-texts';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { getImageUrl } from '../utils/image';

const activeTab = ref<keyof typeof UI_TEXTS.menuManagement.tabs>('items');
const menuItems = ref<MenuItem[]>([]);
const categories = ref<string[]>([]);
const allCustomizations = ref<any[]>([]);

// Restore active tab from localStorage
const savedTab = localStorage.getItem('admin-menu-active-tab');
if (savedTab && (savedTab === 'items' || savedTab === 'customizations')) {
  activeTab.value = savedTab as keyof typeof UI_TEXTS.menuManagement.tabs;
}

// Save active tab to localStorage when changed
watch(activeTab, (newTab) => {
  localStorage.setItem('admin-menu-active-tab', newTab);
});

// Save scroll position before unmount
let savedScrollPosition = 0;
onBeforeUnmount(() => {
  savedScrollPosition = window.scrollY;
  localStorage.setItem('admin-menu-scroll-position', String(savedScrollPosition));
});

const loadMenu = async () => {
  menuItems.value = await menuApi.getMenu();
  categories.value = await menuApi.getCategories();
  allCustomizations.value = await menuApi.getCustomizations();

  // Restore scroll position after data loads
  await nextTick();
  const savedScroll = localStorage.getItem('admin-menu-scroll-position');
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll, 10));
  }
};

onMounted(loadMenu);

const isModalOpen = ref(false);
const isEditing = ref(false);
const currentItem = ref<MenuItem>({
  id: '',
  name: '',
  price: 0,
  category: '',
  description: '',
  imageUrl: '',
  outOfStock: false,
  sort_order: 0,
  groups: [],
});
const isConfirmDialogOpen = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmAction = ref<() => void>(() => {});
const newCategory = ref('');
const unsavedChanges = ref(false);
const imagePreviewError = ref(false);

const isGroupModalOpen = ref(false);
const isEditingGroup = ref(false);
const currentGroupId = ref<string | null>(null);
const newGroup = ref({
  name: '',
  max_selections: 1,
  is_required: false,
  sort_order: 0,
  options: [
    {
      id: undefined as string | undefined,
      name: '',
      price_add: 0,
      is_default: false,
      sort_order: 0,
      delete: false,
    },
  ],
});

const openAddGroupModal = () => {
  isEditingGroup.value = false;
  currentGroupId.value = null;
  newGroup.value = {
    name: '',
    max_selections: 1,
    is_required: false,
    sort_order: 0,
    options: [
      { id: undefined, name: '', price_add: 0, is_default: false, sort_order: 0, delete: false },
    ],
  };
  isGroupModalOpen.value = true;
};

const openEditGroupModal = (group: any) => {
  isEditingGroup.value = true;
  currentGroupId.value = group.id;
  // Deep copy options to avoid mutating original pending save
  const optionsCopy = group.options.map((o: any) => ({
    id: o.id,
    name: o.name,
    price_add: o.price_add,
    is_default: o.is_default || false,
    sort_order: o.sort_order || 0,
    delete: false,
  }));
  newGroup.value = {
    name: group.name,
    max_selections: group.max_selections || 1,
    is_required: group.is_required || false,
    sort_order: group.sort_order || 0,
    options: optionsCopy,
  };
  isGroupModalOpen.value = true;
};

const saveGroup = async () => {
  if (!newGroup.value.name) return;
  const filteredOptions = newGroup.value.options.filter((o) => o.name && !o.delete); // Don't send empty new options
  const deletedOptions = newGroup.value.options.filter((o) => o.delete && o.id); // Options marked for deletion

  const constraints = {
    max_selection: newGroup.value.max_selections,
    is_required: newGroup.value.is_required,
    sort_order: newGroup.value.sort_order,
  };

  if (isEditingGroup.value && currentGroupId.value) {
    // Prepare options for update
    // We need to send all: new, updated, deleted
    const allOptions = [...filteredOptions, ...deletedOptions];

    const success = await menuApi.updateCustomizationGroup(
      currentGroupId.value,
      newGroup.value.name,
      allOptions,
      constraints
    );
    if (success) {
      allCustomizations.value = await menuApi.getCustomizations();
      isGroupModalOpen.value = false;
    }
  } else {
    const id = await menuApi.addCustomizationGroup(
      newGroup.value.name,
      filteredOptions,
      constraints
    );
    if (id) {
      allCustomizations.value = await menuApi.getCustomizations();
      isGroupModalOpen.value = false;
    }
  }
};

const confirmDeleteGroup = (id: string) => {
  openConfirmDialog(
    UI_TEXTS.menuManagement.modals.confirmDialogs.deleteGroup.title,
    UI_TEXTS.menuManagement.modals.confirmDialogs.deleteGroup.message,
    () => deleteGroup(id)
  );
};

const deleteGroup = async (id: string) => {
  const success = await menuApi.deleteCustomizationGroup(id);
  if (success) {
    allCustomizations.value = await menuApi.getCustomizations();
  }
};

const truncateDescription = (desc: string) => {
  const text = desc || '';
  const words = text.split(' ');
  return words.length > 30 ? words.slice(0, 30).join(' ') + '...' : text;
};

const openAddModal = () => {
  isEditing.value = false;
  currentItem.value = {
    id: '',
    name: '',
    price: 0,
    category: '',
    description: '',
    imageUrl: '',
    outOfStock: false,
    sort_order: 0,
    groups: [],
  };
  imagePreviewError.value = false;
  isModalOpen.value = true;
};

const saveItem = () => {
  openConfirmDialog(
    UI_TEXTS.menuManagement.modals.confirmDialogs.save.title,
    UI_TEXTS.menuManagement.modals.confirmDialogs.save.message,
    async () => {
      const updates: any = {
        name: currentItem.value.name,
        price: currentItem.value.price,
        category: currentItem.value.category,
        description: currentItem.value.description,
        imageUrl: currentItem.value.imageUrl,
        outOfStock: currentItem.value.outOfStock,
        sort_order: currentItem.value.sort_order,
        groups: currentItem.value.groups,
      };

      if (isEditing.value) {
        // Update existing item
        const success = await menuApi.updateMenuItem(currentItem.value.id, updates);
        if (success) {
          await loadMenu();
        }
      } else {
        // Add new item
        const id = await menuApi.addMenuItem(updates);
        if (id) {
          await loadMenu();
        }
      }
      unsavedChanges.value = false;
      closeModal();
    }
  );
};

const openConfirmDialog = (title: string, message: string, action: () => void) => {
  confirmDialogTitle.value = title;
  confirmDialogMessage.value = message;
  confirmAction.value = action;
  isConfirmDialogOpen.value = true;
};

const handleConfirmAction = () => {
  confirmAction.value();
  closeConfirmDialog();
};

const confirmDelete = (id: string) => {
  openConfirmDialog(
    UI_TEXTS.menuManagement.modals.confirmDialogs.delete.title,
    UI_TEXTS.menuManagement.modals.confirmDialogs.delete.message,
    () => deleteItem(id)
  );
};

const deleteItem = async (id: string) => {
  const success = await menuApi.deleteMenuItem(id);
  if (success || !success) {
    // Reload anyway to see current state
    await loadMenu();
  }
  closeConfirmDialog();
};

const openEditModal = (item: MenuItem) => {
  isEditing.value = true;
  currentItem.value = { ...item };
  imagePreviewError.value = false;
  isModalOpen.value = true;
};

const confirmCloseModal = () => {
  if (unsavedChanges.value) {
    openConfirmDialog(
      UI_TEXTS.menuManagement.modals.confirmDialogs.unsavedChanges.title,
      UI_TEXTS.menuManagement.modals.confirmDialogs.unsavedChanges.message,
      closeModal
    );
  } else {
    closeModal();
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  currentItem.value = {
    id: '',
    name: '',
    price: 0,
    category: '',
    description: '',
    imageUrl: '',
    outOfStock: false,
    groups: [],
  };
  unsavedChanges.value = false; // Reset unsaved changes flag
};

const closeConfirmDialog = () => {
  isConfirmDialogOpen.value = false;
};

const handleImageInput = () => {
  imagePreviewError.value = false;
};

const addCategory = async (cat: string) => {
  if (cat && !categories.value.includes(cat)) {
    const id = await menuApi.addCategory(cat);
    if (id) {
      categories.value.push(cat);
      currentItem.value.category = cat;
      newCategory.value = '';
    }
  }
};
</script>

<style scoped></style>
