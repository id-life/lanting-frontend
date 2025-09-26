import { StorageKey } from '@/constants';
import { atomWithStorage } from 'jotai/utils';

// Cookie 操作辅助函数
const syncTokenToCookie = (token: string | null) => {
  if (typeof window === 'undefined') return;

  try {
    if (token === null) {
      document.cookie = `${StorageKey.AUTH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } else {
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      document.cookie = `${StorageKey.AUTH_TOKEN}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    }
  } catch (error) {
    console.warn('Failed to sync token to cookie:', error);
  }
};

export const authTokenAtom = atomWithStorage<string | null>(
  StorageKey.AUTH_TOKEN,
  null,
  {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null;
      try {
        const value = localStorage.getItem(key);
        return value; // Return raw string, no JSON.parse
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string | null) => {
      if (typeof window === 'undefined') return;
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value); // Store raw string, no JSON.stringify
        }
        // 同步到 cookie
        syncTokenToCookie(value);
      } catch (error) {
        console.warn('Failed to set localStorage item:', error);
      }
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
        // 同步删除 cookie
        syncTokenToCookie(null);
      } catch (error) {
        console.warn('Failed to remove localStorage item:', error);
      }
    },
  },
  { getOnInit: true },
);
