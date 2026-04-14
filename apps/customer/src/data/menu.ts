import { ref, computed } from 'vue';
import type { MenuItem } from '../types';
import { supabase } from '@app/supabase';

const items = ref<MenuItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const CACHE_KEY = 'achyaben_menu_data';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedData(data: MenuItem[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Failed to save to cache:', e);
  }
}

export async function fetchMenu(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedData();
    if (cached) {
      items.value = cached;
      return;
    }
  }

  if (items.value.length > 0 && !forceRefresh) return;

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
      .order('sort_order', { ascending: true });

    if (sbError) throw sbError;

    if (data) {
      items.value = data.map((item: any) => {
        // Defensive Deduplication: Use a Map to ensure each customization group ID is only used once
        const uniqueGroupsMap = new Map();
        (item.menu_item_customization_groups || []).forEach((j: any) => {
          const gId = j.customization_group?.id;
          if (!gId) return;
          // If duplicate, keep the one with the lowest sort_order (likely the intended one)
          if (!uniqueGroupsMap.has(gId) || j.sort_order < uniqueGroupsMap.get(gId).sort_order) {
            uniqueGroupsMap.set(gId, j);
          }
        });

        const junctionGroups = Array.from(uniqueGroupsMap.values()).sort((a: any, b: any) => {
          // 1. Sort Order
          if ((a.sort_order || 0) !== (b.sort_order || 0)) {
            return (a.sort_order || 0) - (b.sort_order || 0);
          }
          // 2. Requirement (Required first)
          const aReq = a.customization_group?.is_required ? 1 : 0;
          const bReq = b.customization_group?.is_required ? 1 : 0;
          if (aReq !== bReq) return bReq - aReq;
          // 3. Name (Stability)
          return (a.customization_group?.name || '').localeCompare(
            b.customization_group?.name || ''
          );
        });

        const groups = junctionGroups.map((j: any) => ({
          ...j.customization_group,
          sort_order: j.sort_order,
        }));

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category?.name || 'その他',
          categorySort: item.category?.sort_order ?? 999,
          sort_order: item.sort_order ?? 999,
          image: item.image_url,
          available: item.is_available,
          customizations: groups?.flatMap((g: any) =>
            (g.options || []).map((o: any) => ({
              id: o.id,
              name: o.name,
              price: o.price_add,
              available: true,
              is_default: o.is_default,
              sort_order: o.sort_order,
              group_sort_order: g.sort_order,
              group_required: g.is_required,
            }))
          ),
          customizationGroups:
            groups?.map((g: any) => ({
              id: g.id,
              name: g.name,
              min_selection: g.is_required ? 1 : 0,
              max_selection: g.max_selections || 1,
              sort_order: g.sort_order,
              options:
                (g.options || [])
                  .map((o: any) => ({
                    id: o.id,
                    name: o.name,
                    price: o.price_add,
                    available: true,
                    is_default: o.is_default,
                    sort_order: o.sort_order,
                    group_sort_order: g.sort_order,
                    group_required: g.is_required,
                  }))
                  .sort((a: any, b: any) => {
                    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                      return (a.sort_order || 0) - (b.sort_order || 0);
                    }
                    return (a.name || '').localeCompare(b.name || '');
                  }) || [],
            })) || [],
        };
      });

      // Sort menu items by sort_order
      items.value.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

      // Save to cache
      setCachedData(items.value);
    }
  } catch (e) {
    error.value = String(e);
  } finally {
    isLoading.value = false;
  }
}

export async function fetchMenuItem(id: string) {
  // Check memory first
  const existing = items.value.find((i) => String(i.id) === id);
  if (existing) return existing;

  // Check cache
  const cached = getCachedData();
  if (cached) {
    const found = cached.find((i: MenuItem) => String(i.id) === id);
    if (found) {
      items.value = cached; // Restore full menu to state
      return found;
    }
  }

  // Fallback: Fetch single item (still pulls related groups/options)
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
      .eq('id', id)
      .single();

    if (sbError) throw sbError;
    if (data) {
      // Re-use same mapping logic (abstracted would be better, but keeping it simple here)
      const junctionGroups = (data.menu_item_customization_groups || []).sort(
        (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
      );
      const groups = junctionGroups.map((j: any) => ({
        ...j.customization_group,
        sort_order: j.sort_order,
      }));

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category?.name || 'その他',
        categorySort: data.category?.sort_order ?? 999,
        sort_order: data.sort_order ?? 999,
        image: data.image_url,
        available: data.is_available,
        customizationGroups:
          groups?.map((g: any) => ({
            id: g.id,
            name: g.name,
            min_selection: g.is_required ? 1 : 0,
            max_selection: g.max_selections || 1,
            sort_order: g.sort_order,
            options: (g.options || [])
              .map((o: any) => ({
                id: o.id,
                name: o.name,
                price: o.price_add,
                available: true,
                is_default: o.is_default,
                sort_order: o.sort_order,
              }))
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
          })) || [],
      } as any;
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
