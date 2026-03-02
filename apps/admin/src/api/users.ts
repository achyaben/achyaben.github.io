import { supabase } from '@app/supabase';
import type { User, UserRole } from '../types/types';

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('admin_users_view').select('*');

    if (error) {
      console.error('[UsersApi] Error fetching users:', error);
      throw error;
    }

    return (data || []).map((p: any) => {
      const fName = (p.f_name || '').trim();
      const lName = (p.l_name || '').trim();

      // If they are identical (often due to fallback), just use one
      const name = fName.toLowerCase() === lName.toLowerCase() ? fName : `${fName} ${lName}`.trim();

      return {
        id: p.id,
        name: name || 'Unknown User',
        email: (p.email || '').trim(),
        role: p.role as UserRole,
        deleted_at: p.deleted_at,
      };
    });
  },

  async updateUserRole(id: string, role: UserRole): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[UsersApi] Error updating user role:', error);
      return false;
    }
    return true;
  },

  async deleteUser(id: string): Promise<boolean> {
    // Soft-delete by setting deleted_at
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[UsersApi] Error deleting user:', error);
      return false;
    }
    return true;
  },
};
