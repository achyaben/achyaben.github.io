import { supabase } from '@app/supabase';

export const settingsApi = {
  async getRestaurantInfo(): Promise<any> {
    const { data, error } = await supabase.from('settings').select('*');

    if (error) throw error;

    const settingsObj: any = {};
    (data || []).forEach((s) => (settingsObj[s.key] = s.value));
    return settingsObj;
  },

  async updateSettings(key: string, value: any): Promise<boolean> {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    return !error;
  },
};
