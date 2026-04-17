import { supabase } from '@app/supabase';
import type { MenuItem } from '../types/types';

export const menuApi = {
  async getMenu(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select(
        `*, 
         category:menu_categories(name), 
         menu_item_customization_groups(
           sort_order,
           customization_group:customization_groups(
             *, 
             options:customization_options(*)
           )
         )`
      )
      .is('deleted_at', null);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name || 'Unknown',
      description: item.description || '',
      price: Number(item.price),
      category: item.category?.name || 'その他',
      imageUrl: item.image_url,
      outOfStock: !item.is_available,
      sort_order: item.sort_order || 0,
      // Flatten the junction table structure to match the UI expectation and sort by sort_order
      groups: (item.menu_item_customization_groups || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((junction: any) => junction.customization_group),
    })) as any[];
  },

  async updateMenuItem(itemId: string, updates: any): Promise<boolean> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.outOfStock !== undefined) dbUpdates.is_available = !updates.outOfStock;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = Number(updates.sort_order);

    // Map category name to ID
    if (updates.category) {
      const { data: cat } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('name', updates.category)
        .single();
      if (cat) dbUpdates.category_id = cat.id;
    }

    const { error } = await supabase.from('menu_items').update(dbUpdates).eq('id', itemId);

    if (error) return false;

    // Update customization groups linkage using junction table
    if (updates.groups !== undefined) {
      const currentGroupIds = updates.groups.map((g: any) => g.id);

      // Delete all existing associations and re-insert with proper sort_order
      // @ts-ignore - Table exists but types not yet regenerated
      await supabase.from('menu_item_customization_groups').delete().eq('menu_item_id', itemId);

      // Insert all current groups with sort_order based on position
      if (currentGroupIds.length > 0) {
        // @ts-ignore - Table exists but types not yet regenerated
        await supabase.from('menu_item_customization_groups').insert(
          currentGroupIds.map((groupId: string, index: number) => ({
            menu_item_id: itemId,
            customization_group_id: groupId,
            sort_order: index,
          }))
        );
      }
    }

    return true;
  },

  async addMenuItem(item: any): Promise<string | null> {
    const dbItem: any = {
      name: item.name,
      description: item.description,
      price: Number(item.price),
      is_available: !item.outOfStock,
      image_url: item.imageUrl,
      sort_order: item.sort_order || 0,
    };

    // Map category
    const { data: cat } = await supabase
      .from('menu_categories')
      .select('id')
      .eq('name', item.category)
      .single();
    if (cat) dbItem.category_id = cat.id;

    const { data, error } = await supabase.from('menu_items').insert(dbItem).select().single();

    if (error) {
      console.error('[MenuApi] Error adding item:', error);
      return null;
    }

    const itemId = data.id;

    // Link customization groups using junction table
    if (item.groups && item.groups.length > 0) {
      const groupIds = item.groups.map((g: any) => g.id);
      // @ts-ignore - Table exists but types not yet regenerated
      await supabase.from('menu_item_customization_groups').insert(
        groupIds.map((groupId: string, index: number) => ({
          menu_item_id: itemId,
          customization_group_id: groupId,
          sort_order: index,
        }))
      );
    }

    return itemId;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    // Soft delete: set deleted_at so rows referenced by orders are preserved
    const { error } = await supabase
      .from('menu_items')
      .update({ deleted_at: new Date().toISOString(), is_available: false })
      .eq('id', id);

    if (error) {
      console.error('[MenuApi] Error soft-deleting item:', error);
      return false;
    }
    return true;
  },

  async addCategory(name: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('[MenuApi] Error adding category:', error);
      return null;
    }
    return data.id;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('name')
      .order('sort_order');

    if (error) return [];
    return data.map((c) => c.name);
  },

  async getCustomizations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('customization_groups')
      .select('*, options:customization_options(*)')
      .is('deleted_at', null);

    if (error) return [];
    return data || [];
  },

  async addCustomizationGroup(
    name: string,
    options: { name: string; price_add: number; is_default?: boolean; sort_order?: number }[],
    constraints: {
      min_selection?: number;
      max_selection?: number;
      is_required?: boolean;
      sort_order?: number;
    } = {}
  ): Promise<string | null> {
    // 1. Insert Group
    const { data: group, error: groupError } = await supabase
      .from('customization_groups')
      .insert({
        name,
        max_selections: constraints.max_selection ?? 1,
        is_required: constraints.is_required ?? false,
        sort_order: constraints.sort_order ?? 0,
      })
      .select()
      .single();

    if (groupError || !group) {
      console.error('[MenuApi] Error adding customization group:', groupError);
      return null;
    }

    // 2. Insert Options
    if (options.length > 0) {
      const optionsToInsert = options.map((opt) => ({
        group_id: group.id,
        name: opt.name,
        price_add: opt.price_add,
        is_default: !!opt.is_default,
        sort_order: opt.sort_order || 0,
      }));

      const { error: optionsError } = await supabase
        .from('customization_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('[MenuApi] Error adding customization options:', optionsError);
      }
    }

    return group.id;
  },

  async updateCustomizationGroup(
    groupId: string,
    name: string,
    options: {
      id?: string;
      name: string;
      price_add: number;
      sort_order?: number;
      delete?: boolean;
    }[],
    constraints: {
      min_selection?: number;
      max_selection?: number;
      is_required?: boolean;
      sort_order?: number;
    } = {}
  ): Promise<boolean> {
    // 1. Update Group Name & Constraints
    const updates: any = { name };
    if (constraints.max_selection !== undefined) updates.max_selections = constraints.max_selection;
    if (constraints.is_required !== undefined) updates.is_required = constraints.is_required;
    if (constraints.sort_order !== undefined) updates.sort_order = constraints.sort_order;

    const { error: groupError } = await supabase
      .from('customization_groups')
      .update(updates)
      .eq('id', groupId);

    if (groupError) return false;

    // 2. Handle Options
    for (const opt of options) {
      if (opt.delete && opt.id) {
        await supabase
          .from('customization_options')
          .update({ deleted_at: new Date().toISOString(), is_default: false } as any)
          .eq('id', opt.id);
      } else if (opt.id) {
        await supabase
          .from('customization_options')
          .update({
            name: opt.name,
            price_add: opt.price_add,
            is_default: !!(opt as any).is_default,
            sort_order: opt.sort_order || 0,
          })
          .eq('id', opt.id);
      } else {
        await supabase.from('customization_options').insert({
          group_id: groupId,
          name: opt.name,
          price_add: opt.price_add,
          is_default: !!(opt as any).is_default,
          sort_order: opt.sort_order || 0,
        });
      }
    }

    return true;
  },

  async deleteCustomizationGroup(groupId: string): Promise<boolean> {
    // Soft delete options first (RESTRICT FK prevents hard delete if referenced by orders)
    await supabase
      .from('customization_options')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('group_id', groupId)
      .is('deleted_at', null);

    const { error } = await supabase
      .from('customization_groups')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', groupId);

    return !error;
  },
};
