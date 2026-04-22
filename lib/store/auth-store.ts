import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  status: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signup: (name: string, email: string, password: string, role: 'admin' | 'client') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Login failed' });
            return { success: false, error: data.error };
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Determine redirect based on role
          const redirectTo = data.user.role === 'admin' ? '/admin/reports' : '/recommendations';
          
          return { success: true, redirectTo };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      signup: async (name: string, email: string, password: string, role: 'admin' | 'client') => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Signup failed' });
            return { success: false, error: data.error };
          }

          // Auto-login after successful signup
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // only persist user and auth state
    }
  )
);
