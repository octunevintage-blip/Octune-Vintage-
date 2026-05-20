import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      item: null,
      setItem: (product) => set({ item: product }),
      clearCart: () => set({ item: null }),
    }),
    {
      name: 'octune-cart',
    }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      admin: null,
      setUser: (user) => set({ user }),
      setAdmin: (admin) => set({ admin }),
      logout: () => set({ user: null, admin: null }),
    }),
    {
      name: 'octune-auth',
    }
  )
);

// Separate non-persisted store for modal state
export const useAuthModalStore = create((set) => ({
  isOpen: false,
  tab: 'signup', // 'signup' | 'login'
  open: (tab = 'signup') => set({ isOpen: true, tab }),
  close: () => set({ isOpen: false }),
  setTab: (tab) => set({ tab }),
}));
