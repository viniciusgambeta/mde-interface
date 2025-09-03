import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config Check:', {
  url: supabaseUrl ? `Set (${supabaseUrl.substring(0, 20)}...)` : 'MISSING',
  key: supabaseAnonKey ? `Set (${supabaseAnonKey.substring(0, 20)}...)` : 'MISSING',
  env: import.meta.env
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Available env vars:', Object.keys(import.meta.env));
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection immediately
supabase.from('videos').select('count', { count: 'exact', head: true }).then(({ count, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connected successfully. Videos count:', count);
  }
});

// Simplified database types since we're only using auth.users
export type Database = {
  public: {
    Tables: {};
  };
};