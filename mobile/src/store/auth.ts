import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import * as api from '@/lib/api';
import type { User, UserRole } from '@/types/api';

/**
 * Mirrors the web app's `lib/store/auth-store.ts`, with two changes:
 *  - persistence targets `expo-secure-store` on device instead of `localStorage`
 *  - `hasHydrated` lets the auth guard wait for the restore instead of bouncing
 *    an already-signed-in user to the login screen on first paint
 *
 * Note: the API has no session token — it returns the user object and the client
 * decides what to do with it (see `login` below). This is the same trust model as
 * the web app, which keeps a plain boolean in localStorage.
 */

/**
 * SecureStore has no web implementation — `setValueWithKeyAsync` simply does not
 * exist on that platform, so calling it throws `... is not a function` and takes
 * the whole app down during persist rehydration.
 *
 * There is nothing to secure against in a browser tab anyway, so web falls back
 * to `localStorage`. Every other platform gets the keychain / keystore.
 */
const webStorage: StateStorage = {
  getItem: (name) =>
    typeof localStorage === 'undefined' ? null : localStorage.getItem(name),
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

const secureStorage: StateStorage = {
  getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};

const storage = Platform.OS === 'web' ? webStorage : secureStorage;

/**
 * Where a freshly-authenticated user lands, mirroring the web store's redirect:
 * admins to reports, everyone else to search.
 *
 * Typed as a literal union rather than `string` so it stays assignable to
 * Expo Router's typed-route `Href`.
 */
export type DefaultRoute = '/admin/reports' | '/recommendations';

export function defaultRouteFor(role: UserRole | undefined): DefaultRoute {
  return role === 'admin' ? '/admin/reports' : '/recommendations';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; redirectTo?: DefaultRoute }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: string; redirectTo?: DefaultRoute }>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await api.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          return { success: true, redirectTo: defaultRouteFor(user.role) };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      signup: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await api.signup({ name, email, password, role });
          // The API signs the user up but issues no token, so log them straight in.
          const { user: signedIn } = await api.login(email, password);
          const resolved = signedIn ?? user;
          set({ user: resolved, isAuthenticated: true, isLoading: false, error: null });
          return { success: true, redirectTo: defaultRouteFor(resolved.role) };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Signup failed';
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Runs after the secure-store read resolves, on success or failure.
        useAuthStore.setState({ hasHydrated: true });
        void state;
      },
    },
  ),
);