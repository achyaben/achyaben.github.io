<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <!-- Header -->
    <header class="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-600 hover:text-gray-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </router-link>
          <h1 class="text-lg font-bold ml-4">{{ item?.name || UI_TEXT.menu.item.title }}</h1>
        </div>

        <!-- Help Button -->
        <button
          @click="showHelp = true"
          class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>

    <main v-if="item" class="container mx-auto px-4 py-6">
      <!-- Item Image -->
      <div class="aspect-video rounded-xl overflow-hidden mb-6">
        <img :src="getImageUrl(item.image)" :alt="item.name" class="w-full h-full object-cover" />
      </div>

      <!-- Description (moved from bottom) -->
      <div v-if="item.description" class="bg-white rounded-xl p-4 shadow-sm mb-6">
        <h3 class="font-bold text-gray-900 mb-2">{{ UI_TEXT.menu.item.description }}</h3>
        <p class="text-gray-600 whitespace-pre-line leading-relaxed">
          {{ item.description }}
        </p>
      </div>

      <!-- Item Details -->
      <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div class="flex justify-between items-start mb-2">
          <h2 class="text-xl font-bold">{{ item.name }}</h2>
          <div class="text-2xl font-bold text-primary">¥{{ item.price }}</div>
        </div>

        <!-- Quantity Selector -->
        <div class="flex items-center justify-between py-4 border-t border-b">
          <span class="font-medium">{{ UI_TEXT.menu.item.quantity }}</span>
          <div class="flex items-center space-x-4">
            <button
              @click="quantity > 1 ? quantity-- : null"
              class="w-8 h-8 rounded-full border flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'opacity-50 cursor-not-allowed': quantity <= 1 }"
            >
              -
            </button>
            <span class="w-8 text-center font-medium">{{ quantity }}</span>
            <button
              @click="quantity++"
              class="w-8 h-8 rounded-full border flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <!-- Customizations -->
        <div v-if="item.customizationGroups?.length" class="py-4 space-y-6">
          <div v-for="group in item.customizationGroups" :key="group.id">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold">{{ group.name }}</h3>
              <span
                v-if="group.min_selection > 0"
                class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded"
              >
                必須
                <span v-if="group.max_selection > 1"
                  >({{ group.min_selection }}〜{{ group.max_selection }})</span
                >
              </span>
              <span v-else class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                任意 <span v-if="group.max_selection > 0">(最大{{ group.max_selection }})</span>
              </span>
            </div>

            <!-- Radio behavior for single selection -->
            <div v-if="group.max_selection === 1" class="space-y-3">
              <div
                v-for="custom in group.options"
                :key="custom.id"
                @click="toggleOption(group, custom.id)"
                class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                :class="
                  isSelected(custom.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                "
              >
                <div class="flex items-center">
                  <div
                    class="w-5 h-5 rounded-full border flex items-center justify-center mr-3"
                    :class="isSelected(custom.id) ? 'border-primary' : 'border-gray-300'"
                  >
                    <div v-if="isSelected(custom.id)" class="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <span class="font-medium text-gray-700">{{ custom.name }}</span>
                </div>
                <span v-if="custom.price > 0" class="text-gray-600 text-sm font-medium">
                  +¥{{ custom.price }}
                </span>
              </div>
            </div>

            <!-- Quantity behavior for multiple selection -->
            <div v-else class="space-y-3">
              <div
                v-for="custom in group.options"
                :key="'multi-' + custom.id"
                class="flex items-center justify-between p-3 rounded-lg border transition-colors"
                :class="
                  getOptionQuantity(custom.id) > 0
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                "
              >
                <div class="flex flex-col">
                  <span class="font-medium text-gray-700">{{ custom.name }}</span>
                  <span v-if="custom.price > 0" class="text-gray-600 text-sm font-medium">
                    +¥{{ custom.price }}
                  </span>
                </div>
                
                <div class="flex items-center space-x-3 bg-white border rounded-full px-1 py-1 shadow-sm">
                  <button
                    @click.stop="removeOptionQuantity(custom.id)"
                    class="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    :disabled="getOptionQuantity(custom.id) === 0"
                  >
                    -
                  </button>
                  <span class="w-4 text-center font-bold text-gray-800">{{ getOptionQuantity(custom.id) }}</span>
                  <button
                    @click.stop="addOptionQuantity(group, custom.id)"
                    class="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    :disabled="group.max_selection > 0 && getGroupTotalSelections(group) >= group.max_selection"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total and Add to Cart -->
      <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t">
        <div class="container mx-auto p-4">
          <div class="flex justify-between items-center mb-3">
            <div>
              <div class="text-sm text-gray-600">{{ UI_TEXT.menu.item.itemTotal }}</div>
              <div class="text-lg font-bold">¥{{ itemTotal }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600">{{ UI_TEXT.menu.item.cartTotal }}</div>
              <div class="text-lg font-bold text-primary">¥{{ cartAndItemTotal }}</div>
            </div>
          </div>
          <button
            @click="addToCartAndNavigate"
            :disabled="!item.available || !isSelectionValid"
            class="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-all duration-300 flex justify-center items-center gap-2"
          >
            <span v-if="!isSelectionValid" class="text-sm font-normal">(選択が不完全です)</span>
            {{ UI_TEXT.menu.item.addToCart }}
          </button>
        </div>
      </div>
    </main>

    <!-- Help Modal -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showHelp = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold">{{ UI_TEXT.menu.help.title }}</h3>
          <button @click="showHelp = false" class="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <p>{{ UI_TEXT.menu.help.message }}</p>
          <div v-if="restaurantInfo" class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p>
              電話番号：<a :href="`tel:${restaurantInfo.phone}`" class="text-primary">{{
                restaurantInfo.phone
              }}</a>
            </p>
            <p v-if="restaurantInfo.hours">
              受付時間：{{ restaurantInfo.hours.open }}:00 - {{ restaurantInfo.hours.close }}:00
            </p>
            <p>
              メール：<a :href="`mailto:${restaurantInfo.email}`" class="text-primary">{{
                restaurantInfo.email
              }}</a>
            </p>
          </div>
          <div v-else class="text-center py-4 text-gray-400">
            {{ UI_TEXT.common.loading }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { menuItems, fetchMenu } from '../data/menu';
import { useCart } from '../stores/cart';
import type { MenuItem } from '../types';
import { useRestaurantStore } from '../stores/restaurant';
import { UI_TEXT } from '../constants/ui-text';
import { getImageUrl } from '../utils/image';

const route = useRoute();
const router = useRouter();
const { addToCart, cartTotal } = useCart();
const { info: restaurantInfo } = useRestaurantStore();

const item = ref<MenuItem | undefined>();
const quantity = ref(1);
const selectedCustomizations = ref<string[]>([]);
const showHelp = ref(false);

const isSelectionValid = computed(() => {
  if (!item.value?.customizationGroups) return true;

  return item.value.customizationGroups.every((group) => {
    const selectedCount = selectedCustomizations.value.filter((id) =>
      group.options.some((opt) => opt.id === id)
    ).length;

    // Check min (required)
    if (group.min_selection > 0 && selectedCount < group.min_selection) return false;

    // Check max
    if (group.max_selection > 0 && selectedCount > group.max_selection) return false;

    return true;
  });
});

// Override v-model behavior with manual handling for better control
const isSelected = (optionId: string) => selectedCustomizations.value.includes(optionId);

const getOptionQuantity = (optionId: string) => {
  return selectedCustomizations.value.filter((id) => id === optionId).length;
};

const getGroupTotalSelections = (group: any) => {
  return selectedCustomizations.value.filter((id) =>
    group.options.some((opt: any) => opt.id === id)
  ).length;
};

const removeOptionQuantity = (optionId: string) => {
  const index = selectedCustomizations.value.lastIndexOf(optionId);
  if (index !== -1) {
    selectedCustomizations.value.splice(index, 1);
  }
};

const addOptionQuantity = (group: any, optionId: string) => {
  if (group.max_selection === 0 || getGroupTotalSelections(group) < group.max_selection) {
    selectedCustomizations.value.push(optionId);
  }
};

const toggleOption = (group: any, optionId: string) => {
  const isCurrentlySelected = isSelected(optionId);
  if (isCurrentlySelected) {
    // Deselect
    selectedCustomizations.value = selectedCustomizations.value.filter((id) => id !== optionId);
  } else {
    // Select (Radio behavior)
    const otherIds = group.options.map((o: any) => o.id);
    selectedCustomizations.value = [
      ...selectedCustomizations.value.filter((id) => !otherIds.includes(id)),
      optionId,
    ];
  }
};

onMounted(async () => {
  const id = route.params.id as string;

  // If menu is not loaded, fetch it first
  if (menuItems.value.length === 0) {
    await fetchMenu();
  }

  item.value = menuItems.value.find((i) => String(i.id) === id);

  if (!item.value) {
    router.push('/');
    return;
  }

  // Pre-select defaults
  if (item.value.customizationGroups) {
    item.value.customizationGroups.forEach((group) => {
      const defaultOptions = group.options.filter((o) => o.is_default).map((o) => o.id);

      if (defaultOptions.length > 0) {
        // Respect max selections
        const limit = group.max_selection;
        const toSelect = defaultOptions.slice(0, limit);

        toSelect.forEach((id) => {
          if (!selectedCustomizations.value.includes(id)) {
            selectedCustomizations.value.push(id);
          }
        });
      }
    });
  }
});

const itemTotal = computed(() => {
  if (!item.value) return 0;

  const basePrice = item.value.price * quantity.value;
  const customizationsTotal =
    selectedCustomizations.value.reduce((sum, customId) => {
      const customization = item.value?.customizations?.find((c) => c.id === customId);
      return sum + (customization?.price || 0);
    }, 0) * quantity.value;

  return basePrice + customizationsTotal;
});

const cartAndItemTotal = computed(() => {
  return cartTotal.value + itemTotal.value;
});

function addToCartAndNavigate() {
  if (!item.value) return;

  // Add to cart with quantity
  addToCart(item.value, selectedCustomizations.value, quantity.value);

  router.push('/');
}
</script>
