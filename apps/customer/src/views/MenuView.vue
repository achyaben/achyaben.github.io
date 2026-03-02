<template>
  <div class="relative min-h-screen pb-32">
    <!-- Announcement Banner -->
    <div v-if="showAnnouncement" class="bg-primary/10 relative z-40">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            <p class="text-sm text-gray-700">
              7月限定！からあげ弁当が¥100引き！この機会をお見逃しなく！
            </p>
          </div>
          <button @click="closeAnnouncement" class="text-gray-500 hover:text-gray-700">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Items by Selected Category -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-if="isLoading" class="col-span-full flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <MenuCard v-else v-for="item in currentItems" :key="item.id" :item="item" />
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav
      class="fixed py-2 bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t shadow-lg"
    >
      <div class="container mx-auto">
        <div class="flex overflow-x-auto no-scrollbar py-4 px-4 gap-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 flex-shrink-0 transform hover:scale-105 relative',
              selectedCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200',
            ]"
          >
            {{ category }}
            <span
              v-if="getCartCountForCategory(category) > 0"
              class="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-primary"
            >
              {{ getCartCountForCategory(category) }}
            </span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Cart Summary -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xl border-t">
      <div class="container mx-auto p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div
              class="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-primary text-white font-bold text-sm px-2"
            >
              {{ cartItemCount }}
            </div>
            <span class="font-bold text-xl">¥{{ cartTotal }}</span>
          </div>
          <router-link
            to="/cart"
            class="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-300 transform hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            :class="{ 'pointer-events-none opacity-50': cartItemCount === 0 }"
          >
            ご注文へ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import {
  categories as categoryList,
  getMenuItemsByCategory,
  fetchMenu,
  isLoading,
} from '../data/menu';
import MenuCard from '../components/MenuCard.vue';
import { useCart } from '../stores/cart';

const { cartItemCount, cartTotal } = useCart();

onMounted(() => {
  fetchMenu();
  checkAnnouncement();
});

// Categories are loaded async, so we watch them to set initial selectedCategory
const categories = categoryList;
const selectedCategory = ref('');

// Restore selected category from localStorage
const savedCategory = localStorage.getItem('customer-menu-selected-category');
if (savedCategory) {
  selectedCategory.value = savedCategory;
}

watch(
  categories,
  (newCats) => {
    if (newCats.length > 0 && !selectedCategory.value) {
      selectedCategory.value = newCats[0];
    }
  },
  { immediate: true }
);

// Save selected category when changed
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    localStorage.setItem('customer-menu-selected-category', newCategory);
  }
});

// Save scroll position before unmount
onBeforeUnmount(() => {
  localStorage.setItem('customer-menu-scroll-position', String(window.scrollY));
});

// Restore scroll position after menu loads
watch(isLoading, async (loading) => {
  if (!loading) {
    await nextTick();
    const savedScroll = localStorage.getItem('customer-menu-scroll-position');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }
  }
});

const currentItems = computed(() => {
  if (!selectedCategory.value) return [];
  return getMenuItemsByCategory(selectedCategory.value).value;
});

// Count how many items from a category are in the cart (sum of quantities)
const { cartItems } = useCart();
const getCartCountForCategory = (category: string) => {
  return cartItems.value
    .filter((cartItem) => cartItem.item.category === category)
    .reduce((sum: number, cartItem) => sum + cartItem.quantity, 0);
};

const ANNOUNCEMENT_ID = 'banner-2025-07-limit';

function checkAnnouncement() {
  const dismissed = localStorage.getItem(`app-banner-dismissed-${ANNOUNCEMENT_ID}`);
  showAnnouncement.value = !dismissed;
}

const showAnnouncement = ref(false);

function closeAnnouncement() {
  showAnnouncement.value = false;
  localStorage.setItem(`app-banner-dismissed-${ANNOUNCEMENT_ID}`, 'true');
}
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
