import { ref, computed } from 'vue';
import { supabase } from '@app/supabase';
import { RESTAURANT_INFO } from '../config/restaurant';

interface BusinessHours {
  open: number;
  close: number;
  orderDeadline: number;
  minAdvanceTime: number;
  maxAdvanceDays: number;
  businessDays: readonly number[];
  holidays?: readonly string[];
  specialDays?: readonly string[];
}

interface RestaurantInfo {
  name: string;
  app_name: string;
  address: {
    postal: string;
    prefecture: string;
    city: string;
    line1: string;
    googleMapUrl: string;
  };
  calendar_link: string;
  sns: {
    instagram: string;
    x: string;
    facebook: string;
    line: string;
    tiktok: string;
    youtube: string;
    google: string;
  };
  phone: string;
  email: string;
  recovery_form: string;
  hours: BusinessHours;
  delivery_hours: { start: string; end: string };
  banners?: Array<{ id: string; title: string; link?: string; active: boolean }> | null;
}

const info = ref<RestaurantInfo>(RESTAURANT_INFO);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isFetched = ref(false);
const orderingEnabled = ref(true);
const isGlobalError = ref(false);

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Sun: 0,
  sunday: 0,
  Monday: 1,
  Mon: 1,
  monday: 1,
  Tuesday: 2,
  Tue: 2,
  tuesday: 2,
  Wednesday: 3,
  Wed: 3,
  wednesday: 3,
  Thursday: 4,
  Thu: 4,
  thursday: 4,
  Friday: 5,
  Fri: 5,
  friday: 5,
  Saturday: 6,
  Sat: 6,
  saturday: 6,
};

function parseHour(val: any): number {
  return typeof val === 'string' ? parseInt(val.split(':')[0], 10) : Number(val);
}

function normalizeBusinessDays(days: any): readonly number[] {
  if (!Array.isArray(days) || days.length === 0) return days;
  if (typeof days[0] !== 'string') return days;

  return days.map((d: string) => DAY_MAP[d] ?? -1).filter((d: number) => d !== -1);
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function isEmpty(val: any): boolean {
  if (val === null || val === undefined || val === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (isObject(val) && Object.keys(val).length === 0) return true;
  return false;
}

/**
 * Deep merges server data into a fresh copy of the fallback data.
 * If server value is "empty", the fallback value is retained.
 */
function mergeWithFallback<T extends Record<string, any>>(server: any, fallback: T): T {
  // start with a deep copy of fallback
  const result = JSON.parse(JSON.stringify(fallback));

  if (!server || typeof server !== 'object') return result;

  for (const key in result) {
    const serverVal = server[key];

    if (isObject(result[key])) {
      // Nested object - recurse
      result[key] = mergeWithFallback(serverVal, result[key]);
    } else {
      // Primitive or Array - take server if not empty
      if (!isEmpty(serverVal)) {
        result[key] = serverVal;
      }
    }
  }
  return result as T;
}

export const useRestaurantStore = () => {
  async function fetchInfo() {
    if (isFetched.value || isLoading.value) return;

    isLoading.value = true;
    isGlobalError.value = false;

    try {
      const { data, error: sbError } = await supabase.from('settings').select('*');

      if (sbError) throw sbError;

      if (data && Array.isArray(data)) {
        const settings: any = {};
        data.forEach((s: any) => {
          // Try to parse if it looks like JSON, otherwise keep as is
          let val = s.value;
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              val = JSON.parse(val);
            } catch {
              /* ignore */
            }
          }
          settings[s.key] = val;
        });

        const serverData = {
          name: settings.restaurant_name,
          app_name: settings.app_name,
          phone: settings.restaurant_phone,
          email: settings.restaurant_email,
          calendar_link: settings.calendar_link,
          recovery_form: settings.recovery_form,
          address: settings.restaurant_address,
          sns: settings.sns,
          hours: settings.business_hours,
          delivery_hours: settings.delivery_hours,
          banners: settings.banners,
        };

        info.value = mergeWithFallback(serverData, RESTAURANT_INFO);

        orderingEnabled.value =
          settings.ordering_enabled !== false && settings.ordering_enabled !== 'false';

        // Normalize hours format
        const hours = info.value.hours as any;
        if (hours.open !== undefined) hours.open = parseHour(hours.open);
        if (hours.close !== undefined) hours.close = parseHour(hours.close);
        if (hours.orderDeadline !== undefined) hours.orderDeadline = parseHour(hours.orderDeadline);
        if (hours.businessDays) hours.businessDays = normalizeBusinessDays(hours.businessDays);

        isFetched.value = true;
      }
    } catch (e) {
      console.error('Failed to fetch restaurant info, using fallback:', e);
      error.value = String(e);
      isGlobalError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    info: computed(() => info.value),
    activeBanner: computed(() => {
      if (!info.value.banners || !Array.isArray(info.value.banners)) return null;
      // Return the most recent active banner
      const activeBanners = info.value.banners.filter((b) => b.active);
      return activeBanners.length > 0 ? activeBanners[activeBanners.length - 1] : null;
    }),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    orderingEnabled: computed(() => orderingEnabled.value),
    isError: computed(() => isGlobalError.value),
    fetchInfo,
  };
};
