<template>
  <div class="bg-white p-4">
    <div class="flex items-start gap-4">
      <router-link :to="`/item/${cartItem.item.id}`" class="block shrink-0">
        <img
          :src="getImageUrl(cartItem.item.image)"
          :alt="cartItem.item.name"
          class="w-20 h-20 object-cover rounded-md bg-gray-100 hover:opacity-80 transition-opacity"
        />
      </router-link>

      <div class="flex-1">
        <div class="flex justify-between items-start">
          <div>
            <router-link
              :to="`/item/${cartItem.item.id}`"
              class="font-medium hover:text-primary transition-colors pr-1"
            >
              {{ cartItem.item.name }}
            </router-link>
            <span
              v-if="cartItem.customizations?.length"
              class="text-xs font-medium text-gray-400 whitespace-nowrap"
            >
              (¥{{ cartItem.item.price }})
            </span>
            <div v-if="cartItem.customizations?.length" class="text-sm text-gray-600 mt-1">
              <div v-for="custom in groupedCustomizations" :key="custom.id">
                {{ custom.name }}
                <span class="font-medium text-gray-800" v-if="custom.quantity > 1"
                  >×{{ custom.quantity }}</span
                >
                <span class="text-gray-500" v-if="custom.totalPrice">
                  (+¥{{ custom.totalPrice }})
                </span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="font-medium">¥{{ cartItem.subtotal }}</div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center space-x-2">
            <button
              @click="decrementQuantity"
              class="w-8 h-8 flex items-center justify-center rounded-full border text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="cartItem.quantity <= 1"
            >
              -
            </button>
            <span class="w-8 text-center">{{ cartItem.quantity }}</span>
            <button
              @click="incrementQuantity"
              class="w-8 h-8 flex items-center justify-center rounded-full border text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              +
            </button>
          </div>

          <button
            @click="removeItem"
            class="text-red-500 text-sm hover:text-red-600 transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCart } from '../stores/cart';
import { getImageUrl } from '../utils/image';
import type { MenuItem } from '../types';

interface CartItemProps {
  item: MenuItem;
  quantity: number;
  customizations: string[];
  subtotal: number;
}

const props = defineProps<{
  cartItem: CartItemProps;
}>();

const { updateQuantity, removeFromCart } = useCart();

const groupedCustomizations = computed(() => {
  const counts: Record<string, number> = {};
  if (!props.cartItem.customizations) return [];

  props.cartItem.customizations.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([id, quantity]) => {
      const customization = props.cartItem.item.customizations?.find((c: any) => c.id === id);
      const price = customization?.price || 0;
      return {
        id,
        quantity,
        name: customization?.name || '',
        unitPrice: price,
        totalPrice: price ? price * quantity : undefined,
        sort_order: customization?.sort_order || 0,
        group_sort_order: customization?.group_sort_order || 0,
        group_required: customization?.group_required || false,
      };
    })
    .sort((a, b) => {
      // 1. Group Sort Order
      if (a.group_sort_order !== b.group_sort_order) {
        return a.group_sort_order - b.group_sort_order;
      }
      // 2. Group Required (Tie-breaker for group)
      if (a.group_required !== b.group_required) {
        return a.group_required ? -1 : 1;
      }
      // 3. Option Sort Order (Tie-breaker within group)
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      // 4. Name (Final stability)
      return (a.name || '').localeCompare(b.name || '');
    });
});

function incrementQuantity() {
  updateQuantity(
    props.cartItem.item.id,
    props.cartItem.quantity + 1,
    props.cartItem.customizations
  );
}

function decrementQuantity() {
  if (props.cartItem.quantity > 1) {
    updateQuantity(
      props.cartItem.item.id,
      props.cartItem.quantity - 1,
      props.cartItem.customizations
    );
  }
}

function removeItem() {
  removeFromCart(props.cartItem.item.id, props.cartItem.customizations);
}
</script>
