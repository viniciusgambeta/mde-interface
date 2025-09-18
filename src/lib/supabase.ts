import { createClient } from '@supabase/supabase-js';

// Custom storage adapter with fallback to memory storage
class StorageAdapter {
  private memoryStorage: Map<string, string> = new Map();
  private useMemoryFallback = false;

  getItem(key: string): string | null {
    if (this.useMemoryFallback) {
      return this.memoryStorage.get(key) || null;
    }

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('SessionStorage failed, falling back to memory storage:', error);
      this.useMemoryFallback = true;
      return this.memoryStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    if (this.useMemoryFallback) {
      this.memoryStorage.set(key, value);
      return;
    }

    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('SessionStorage quota exceeded, clearing and retrying...');
        this.clearSupabaseTokens();
        try {
          sessionStorage.setItem(key, value);
        } catch (retryError) {
          console.warn('SessionStorage still failing, switching to memory storage');
          this.useMemoryFallback = true;
          this.memoryStorage.set(key, value);
        }
      } else {
        console.warn('SessionStorage failed, falling back to memory storage:', error);
        this.useMemoryFallback = true;
        this.memoryStorage.set(key, value);
      }
    }
  }

  removeItem(key: string): void {
    if (this.useMemoryFallback) {
      this.memoryStorage.delete(key);
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('SessionStorage removeItem failed:', error);
      this.memoryStorage.delete(key);
    }
  }

  private clearSupabaseTokens(): void {
    try {
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.includes('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear localStorage as backup
      const localKeys = Object.keys(localStorage);
      localKeys.forEach(key => {
        if (key.includes('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  }
}

// Preventive cleanup function
export const clearOldSupabaseTokens = (): void => {
  try {
    // Clear from both storages
    [localStorage, sessionStorage].forEach(storage => {
      try {
        const keys = Object.keys(storage);
        keys.forEach(key => {
          if (key.includes('sb-') || key.includes('supabase')) {
            storage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Error clearing storage:', error);
      }
    });
  } catch (error) {
    console.warn('Error in preventive cleanup:', error);
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create custom storage adapter instance
const storageAdapter = new StorageAdapter();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Simplified database types since we're only using auth.users
export type Database = {
  public: {
    Tables: {};
  };
};