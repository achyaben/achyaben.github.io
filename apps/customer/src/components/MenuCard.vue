<template>
  <div
    @click="router.push({ name: 'itemDetail', params: { id: item.id } })"
    class="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative cursor-pointer"
    :class="{ 'border-2 border-primary': quantity > 0 }"
  >
    <div class="relative aspect-square sm:aspect-[4/3] transition-all duration-300 bg-gray-100">
      <img
        :src="getImageUrl(item.image)"
        :alt="item.name"
        class="w-full h-full object-cover transition-transform duration-500"
      />

      <!-- Customization Badge Overlay (bottom-left) -->
      <span
        v-if="item.customizations && item.customizations.length > 0"
        class="absolute bottom-2 left-2 text-[9px] sm:text-[10px] bg-white text-primary px-1.5 py-0.5 rounded font-bold shadow-md border border-primary z-10"
        :title="defaultOptionNames || '詳細で選択'"
      >
        {{ defaultOptionNames || 'トッピング可' }}
      </span>

      <!-- Sold Out Overlay -->
      <div
        v-if="!item.available"
        class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <span class="text-white font-medium px-3 py-1 bg-red-500/90 rounded-lg text-sm">
          売り切れ
        </span>
      </div>

      <!-- Floating Action Controls (Overlay) -->
      <div class="absolute bottom-2 right-2 flex gap-2 items-center z-20" @click.stop>
        <!-- Quantity Controls (if already in cart) -->
        <div
          v-if="quantity > 0"
          class="flex items-center shadow-lg rounded-full bg-white overflow-hidden border border-gray-100"
        >
          <button
            @click.stop="handleRemoveOne"
            class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-colors"
          >
            <span v-if="quantity === 1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </span>
            <span v-else class="font-bold text-base">-</span>
          </button>
          <span class="w-8 text-center text-base font-bold bg-white">{{ quantity }}</span>
          <button
            @click.stop="handleAddToCart"
            class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
          >
            <span class="font-bold text-base">+</span>
          </button>
        </div>

        <!-- Add Button (if 0) -->
        <button
          v-else-if="item.available"
          @click.stop="handleAddToCart"
          class="shadow-xl rounded-full p-2.5 flex items-center justify-center transition-all duration-300 bg-primary text-white hover:bg-primary-dark hover:scale-110 active:scale-95 border-none"
        >
          <span v-if="hasRequiredCustomizations && !canUseDefaults" class="text-sm font-bold px-3"
            >詳細</span
          >
          <svg
            v-else
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
    <!-- Show a note if other variants are in the cart -->
    <div 
      v-if="otherQuantity > 0" 
      @click.stop="router.push('/cart')"
      class="text-xs text-primary font-medium bg-primary/5 py-1.5 px-3 rounded mx-3 mb-2 flex items-center justify-between border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
    >
      <div class="flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        他のカスタマイズが {{ otherQuantity }} 点あります
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-60 ml-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </div>

    <div class="p-3 pt-2">
      <div class="space-y-1">
        <div class="flex justify-between items-start mb-1">
          <h3 class="font-bold text-gray-900 text-base leading-tight line-clamp-1">
            {{ item.name }}
          </h3>
          <div class="font-bold text-base text-primary whitespace-nowrap ml-2">
            ¥{{ item.price }}
          </div>
        </div>

        <!-- Description (now 2 lines) -->
        <p class="text-[10px] sm:text-xs text-gray-500 line-clamp-2 transition-all">
          {{ item.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { MenuItem } from '../types';
import { useCart } from '../stores/cart';
import { getImageUrl } from '../utils/image';

const props = defineProps<{
  item: MenuItem;
}>();

const { cartItems, getItemQuantity, addToCart, updateQuantity } = useCart();

const currentDefaultCustomizations = computed(() => {
  const defaults: string[] = [];
  if (props.item.customizationGroups) {
    props.item.customizationGroups.forEach((group) => {
      const groupDefaults = group.options.filter((o) => o.is_default).map((o) => o.id);
      defaults.push(...groupDefaults.slice(0, group.max_selection));
    });
  }
  return defaults;
});

const defaultOptionNames = computed(() => {
  if (!props.item.customizationGroups) return '';

  const names: string[] = [];
  props.item.customizationGroups.forEach((group) => {
    // Only show if required or has defaults
    if (group.min_selection > 0 || group.options.some((o) => o.is_default)) {
      const groupDefaults = group.options
        .filter((o) => o.is_default)
        .map((o) => `${group.name}: ${o.name}`);
      if (groupDefaults.length > 0) {
        names.push(...groupDefaults);
      }
    }
  });

  if (names.length === 0 && hasRequiredCustomizations.value) return '';

  return names.join('、');
});

const quantity = computed(() => getItemQuantity(props.item.id, currentDefaultCustomizations.value));

const totalQuantity = computed(() => {
  return cartItems.value
    .filter((i) => i.item.id === props.item.id)
    .reduce((sum, i) => sum + i.quantity, 0);
});

const otherQuantity = computed(() => {
  return totalQuantity.value - quantity.value;
});

const hasRequiredCustomizations = computed(() => {
  return props.item.customizationGroups?.some((g) => g.min_selection > 0) ?? false;
});

const canUseDefaults = computed(() => {
  // Check if defaults satisfy all required groups
  if (!props.item.customizationGroups) return true;

  return props.item.customizationGroups.every((group) => {
    if (group.min_selection === 0) return true; // Optional group

    // Count defaults
    const defaultCount = group.options.filter((o) => o.is_default).length;
    return defaultCount >= group.min_selection && defaultCount <= group.max_selection;
  });
});

const router = useRouter();

function handleAddToCart() {
  if (!props.item.available) return;

  if (hasRequiredCustomizations.value && !canUseDefaults.value) {
    router.push({ name: 'itemDetail', params: { id: props.item.id } });
  } else {
    addToCart(props.item, currentDefaultCustomizations.value);
  }
}

function handleRemoveOne() {
  // Check if we have an item with these exact customizations
  const currentQ = getItemQuantity(props.item.id, currentDefaultCustomizations.value);
  if (currentQ > 0) {
    updateQuantity(props.item.id, currentQ - 1, currentDefaultCustomizations.value);
  } else {
    // Fallback: If we have ANY of this item in the cart, maybe we should warn?
    // Or just do nothing since we can't safely match what to remove.
    alert('詳細は注文画面で変更してください');
  }
}
</script>
