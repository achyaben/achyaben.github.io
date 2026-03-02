import { ref, computed } from 'vue';
import type { MenuItem } from '../types';
import { supabase } from '@app/supabase';

const items = ref<MenuItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export async function fetchMenu() {
  if (items.value.length > 0) return;

  isLoading.value = true;
  try {
    const { data, error: sbError } = await supabase
      .from('menu_items')
      .select(
        `*, 
         category:menu_categories(name, sort_order), 
         menu_item_customization_groups(
           sort_order,
           customization_group:customization_groups(
             *, 
             options:customization_options(*)
           )
         )`
      )
      .eq('is_available', true);

    if (sbError) throw sbError;

    if (data) {
      items.value = data.map((item: any) => {
        // Extract customization groups from junction table
        const groups = (item.menu_item_customization_groups || []).map(
          (junction: any) => junction.customization_group
        );

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category?.name || 'その他',
          categorySort: item.category?.sort_order ?? 999, // Store sort_order for later use
          sort_order: item.sort_order ?? 999, // Store menu item sort_order
          image: item.image_url,
          available: item.is_available,
          customizations: groups?.flatMap(
            (g: any) =>
              g.options?.map((o: any) => ({
                id: o.id,
                name: o.name,
                price: o.price_add,
                available: true,
                is_default: o.is_default,
              })) || []
          ),
          customizationGroups:
            groups?.map((g: any) => ({
              id: g.id,
              name: g.name,
              min_selection: g.is_required ? 1 : 0,
              max_selection: g.max_selections || 1,
              options:
                g.options?.map((o: any) => ({
                  id: o.id,
                  name: o.name,
                  price: o.price_add,
                  available: true,
                  is_default: o.is_default,
                })) || [],
            })) || [],
        };
      });

      // Sort menu items by sort_order
      items.value.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  } catch (e) {
    error.value = String(e);
  } finally {
    isLoading.value = false;
  }
}

export const menuItems = computed(() => items.value);

export const categories = computed(() => {
  // Get unique categories with their sort order
  const categoryMap = new Map<string, number>();
  items.value.forEach((item: any) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, item.categorySort || 999);
    }
  });

  // Sort by sort_order
  return Array.from(categoryMap.entries())
    .sort(([, a], [, b]) => a - b)
    .map(([name]) => name);
});

export const getMenuItemsByCategory = (category: string) =>
  computed(() => items.value.filter((i) => (i.category || 'その他') === category));

const ORDER_CONSTANTS = {
  TRACKING_ID_LENGTH: 6,
  TRACKING_ID_CHARS: '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
};

export function generateTrackingId(): string {
  return Array.from({ length: ORDER_CONSTANTS.TRACKING_ID_LENGTH }, () =>
    ORDER_CONSTANTS.TRACKING_ID_CHARS.charAt(
      Math.floor(Math.random() * ORDER_CONSTANTS.TRACKING_ID_CHARS.length)
    )
  ).join('');
}

export { isLoading, error };
