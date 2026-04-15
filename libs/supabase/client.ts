import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    timeout: 30000,
    heartbeatIntervalMs: 15000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
  },
});
