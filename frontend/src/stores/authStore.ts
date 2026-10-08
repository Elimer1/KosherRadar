import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  // True only after the server rejected our token. Not saved in localStorage.
  sessionExpired: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  expireSession: () => void;
  dismissSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      sessionExpired: false,

      setAuth: (token, user) => set({ token, user, sessionExpired: false }),
      logout: () => set({ token: null, user: null, sessionExpired: false }),
      expireSession: () => set({ token: null, user: null, sessionExpired: true }),
      dismissSessionExpired: () => set({ sessionExpired: false }),
    }),
    {
      name: 'kosherradar-auth',
      // Only the token and user are stored in localStorage.
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
