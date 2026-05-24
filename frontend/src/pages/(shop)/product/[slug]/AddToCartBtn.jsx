'use client';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Lock } from 'lucide-react';

export default function AddToCartBtn({ product, isLocked, isReserved }) {
  const { setItem, item } = useCartStore();
  const { user } = useAuthStore();
  const { open } = useAuthModalStore();
  const router = useRouter();

  const handleAdd = () => {
    if (!user) {
      open('signup');
      return;
    }
    setItem(product);
    router.push('/cart');
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      open('signup');
      return;
    }
    router.push('/cart');
  };

  if (isReserved) {
    return (
      <motion.button
        disabled
        className="w-full flex items-center justify-center gap-3 bg-[#f4f4f4] text-[#999] cursor-not-allowed font-display uppercase font-bold tracking-[0.15em] py-4 text-xs border border-[#e0e0e0]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Lock size={14} />
        RESERVED
      </motion.button>
    );
  }

  if (isLocked) {
    return (
      <motion.button
        disabled
        className="w-full flex items-center justify-center gap-3 bg-[#f4f4f4] text-[#999] cursor-not-allowed font-display uppercase font-bold tracking-[0.15em] py-4 text-xs border border-[#e0e0e0]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Lock size={14} />
        UNAVAILABLE
      </motion.button>
    );
  }

  if (item?._id === product._id) {
    return (
      <motion.button
        onClick={handleCheckoutRedirect}
        className="w-full flex items-center justify-center gap-3 bg-black text-white font-display uppercase font-bold tracking-[0.15em] py-4 text-xs relative overflow-hidden group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-[#222] to-[#444] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
        <span className="relative flex items-center gap-3">
          GO TO CHECKOUT
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleAdd}
      className="w-full flex items-center justify-center gap-3 bg-black text-white font-display uppercase font-bold tracking-[0.15em] py-4 text-xs relative overflow-hidden group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Shine sweep on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
      <span className="relative flex items-center gap-3">
        <ShoppingBag size={14} strokeWidth={2.5} />
        ADD TO CART
      </span>
    </motion.button>
  );
}
