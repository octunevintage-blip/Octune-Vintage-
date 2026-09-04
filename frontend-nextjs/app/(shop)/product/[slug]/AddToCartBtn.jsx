'use client';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { trackAddToCart } from '@/lib/metaPixel';

export default function AddToCartBtn({ product, isLocked }) {
  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const { open } = useAuthModalStore();
  const router = useRouter();

  if (isLocked) {
    return (
      <motion.button
        disabled
        className="w-full flex items-center justify-center gap-3 bg-[#f4f4f4] text-[#999] cursor-not-allowed font-display uppercase font-bold tracking-[0.15em] py-4 text-xs border border-[#e0e0e0]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Lock size={16} />
        Drop Locked
      </motion.button>
    );
  }

  const isAlreadyInCart = (items || []).some(i => i._id === product._id);

  const handleAddToCart = () => {
    if (isAlreadyInCart) {
      router.push('/cart');
    } else {
      addItem(product);
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: product.price || 0,
        currency: 'INR',
      });
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      open('signup');
      return;
    }
    trackAddToCart({
      id: product._id,
      name: product.name,
      price: product.price || 0,
      currency: 'INR',
    });
    useCartStore.getState().setBuyNowItem(product);
    router.push('/checkout?mode=buyNow');
  };

  return (
    <div className="flex w-full gap-3">
      <motion.button
        onClick={handleAddToCart}
        className="flex-1 flex items-center justify-center gap-2 bg-white text-black border border-black font-display uppercase font-bold tracking-[0.1em] py-4 text-xs relative overflow-hidden group hover:bg-black/5 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <ShoppingBag size={14} strokeWidth={2.5} />
        {isAlreadyInCart ? 'GO TO CART' : 'ADD TO CART'}
      </motion.button>

      <motion.button
        onClick={handleBuyNow}
        className="flex-1 flex items-center justify-center gap-2 bg-black text-white border border-black font-display uppercase font-bold tracking-[0.1em] py-4 text-xs relative overflow-hidden group hover:bg-black/90 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <span className="relative flex items-center gap-2">
          BUY NOW
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </div>
  );
}
