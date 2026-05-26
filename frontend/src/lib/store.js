import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      item: null,
      addItem: (product) => {
        const items = get().items || [];
        const exists = items.some((i) => i._id === product._id);
        if (!exists) {
          const newItems = [...items, product];
          set({ items: newItems, item: newItems[0] });
        }
      },
      removeItem: (productId) => {
        const newItems = (get().items || []).filter((i) => i._id !== productId);
        set({ items: newItems, item: newItems[0] || null });
      },
      setItem: (product) => set({ items: product ? [product] : [], item: product }),
      clearCart: () => set({ items: [], item: null }),
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
