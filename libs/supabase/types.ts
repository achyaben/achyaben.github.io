export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4';
  };
  public: {
    Tables: {
      customization_groups: {
        Row: {
          allow_multiple: boolean | null;
          deleted_at: string | null;
          id: string;
          is_required: boolean | null;
          max_selections: number | null;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          allow_multiple?: boolean | null;
          deleted_at?: string | null;
          id?: string;
          is_required?: boolean | null;
          max_selections?: number | null;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          allow_multiple?: boolean | null;
          deleted_at?: string | null;
          id?: string;
          is_required?: boolean | null;
          max_selections?: number | null;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      customization_options: {
        Row: {
          deleted_at: string | null;
          group_id: string;
          id: string;
          is_default: boolean | null;
          name: string;
          price_add: number | null;
          sort_order: number | null;
        };
        Insert: {
          deleted_at?: string | null;
          group_id: string;
          id?: string;
          is_default?: boolean | null;
          name: string;
          price_add?: number | null;
          sort_order?: number | null;
        };
        Update: {
          deleted_at?: string | null;
          group_id?: string;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          price_add?: number | null;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customization_options_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'customization_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_categories: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      menu_item_customization_groups: {
        Row: {
          created_at: string | null;
          customization_group_id: string;
          id: string;
          menu_item_id: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          customization_group_id: string;
          id?: string;
          menu_item_id: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          customization_group_id?: string;
          id?: string;
          menu_item_id?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_item_customization_groups_customization_group_id_fkey';
            columns: ['customization_group_id'];
            isOneToOne: false;
            referencedRelation: 'customization_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'menu_item_customization_groups_menu_item_id_fkey';
            columns: ['menu_item_id'];
            isOneToOne: false;
            referencedRelation: 'menu_items';
            referencedColumns: ['id'];
          },
        ];
      };
      menu_items: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_available: boolean | null;
          name: string;
          price: number;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          name: string;
          price: number;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          name?: string;
          price?: number;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'menu_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      order_item_customizations: {
        Row: {
          created_at: string | null;
          customization_option_id: string;
          id: string;
          order_item_id: string;
        };
        Insert: {
          created_at?: string | null;
          customization_option_id: string;
          id?: string;
          order_item_id: string;
        };
        Update: {
          created_at?: string | null;
          customization_option_id?: string;
          id?: string;
          order_item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_item_customizations_customization_option_id_fkey';
            columns: ['customization_option_id'];
            isOneToOne: false;
            referencedRelation: 'customization_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_item_customizations_order_item_id_fkey';
            columns: ['order_item_id'];
            isOneToOne: false;
            referencedRelation: 'order_items';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          line_total: number;
          menu_item_id: string;
          order_id: string;
          price_at_order: number;
          quantity: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          line_total: number;
          menu_item_id: string;
          order_id: string;
          price_at_order: number;
          quantity: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          line_total?: number;
          menu_item_id?: string;
          order_id?: string;
          price_at_order?: number;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_menu_item_id_fkey';
            columns: ['menu_item_id'];
            isOneToOne: false;
            referencedRelation: 'menu_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders_with_customer';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          delivery_datetime: string;
          driver_id: string | null;
          id: string;
          notes: string | null;
          order_type: string | null;
          payment_id: string | null;
          payment_method: string;
          payment_status: string | null;
          status: string;
          total: number;
          tracking_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          delivery_datetime: string;
          driver_id?: string | null;
          id?: string;
          notes?: string | null;
          order_type?: string | null;
          payment_id?: string | null;
          payment_method?: string;
          payment_status?: string | null;
          status?: string;
          total: number;
          tracking_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          delivery_datetime?: string;
          driver_id?: string | null;
          id?: string;
          notes?: string | null;
          order_type?: string | null;
          payment_id?: string | null;
          payment_method?: string;
          payment_status?: string | null;
          status?: string;
          total?: number;
          tracking_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          address: string;
          avatar_url: string | null;
          corporate_name: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          f_name: string | null;
          id: string;
          l_name: string | null;
          lat: number | null;
          line_user_id: string | null;
          lng: number | null;
          postcode: string | null;
          provider: string | null;
          role: string;
          tel: string | null;
          updated_at: string | null;
        };
        Insert: {
          address: string;
          avatar_url?: string | null;
          corporate_name?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          f_name?: string | null;
          id: string;
          l_name?: string | null;
          lat?: number | null;
          line_user_id?: string | null;
          lng?: number | null;
          postcode?: string | null;
          provider?: string | null;
          role?: string;
          tel?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string;
          avatar_url?: string | null;
          corporate_name?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          f_name?: string | null;
          id?: string;
          l_name?: string | null;
          lat?: number | null;
          line_user_id?: string | null;
          lng?: number | null;
          postcode?: string | null;
          provider?: string | null;
          role?: string;
          tel?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_users_view: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string | null;
          f_name: string | null;
          id: string | null;
          l_name: string | null;
          line_user_id: string | null;
          provider: string | null;
          role: string | null;
          tel: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          f_name?: string | null;
          id?: string | null;
          l_name?: string | null;
          line_user_id?: string | null;
          provider?: string | null;
          role?: string | null;
          tel?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          f_name?: string | null;
          id?: string | null;
          l_name?: string | null;
          line_user_id?: string | null;
          provider?: string | null;
          role?: string | null;
          tel?: string | null;
        };
        Relationships: [];
      };
      orders_with_customer: {
        Row: {
          created_at: string | null;
          customer_address: string | null;
          customer_company: string | null;
          customer_f_name: string | null;
          customer_l_name: string | null;
          customer_postcode: string | null;
          customer_tel: string | null;
          delivery_datetime: string | null;
          driver_id: string | null;
          id: string | null;
          notes: string | null;
          order_type: string | null;
          payment_id: string | null;
          payment_method: string | null;
          payment_status: string | null;
          status: string | null;
          total: number | null;
          tracking_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_driver_id_fkey';
            columns: ['driver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'admin_users_view';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      create_complete_order: { Args: { payload: Json }; Returns: string };
      get_user_id_by_email: { Args: { email_input: string }; Returns: string };
      is_admin_or_manager: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
