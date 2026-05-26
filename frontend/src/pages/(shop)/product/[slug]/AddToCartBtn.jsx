'use client';
import { useState } from 'react';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AddToCartBtn({ product, isLocked, isReserved }) {
  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const { open } = useAuthModalStore();
  const router = useRouter();

  const handleAdd = () => {
    if (!user) {
      open('signup');
      return;
    }
    addItem(product);
    router.push('/cart');
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      open('signup');
      return;
    }
    router.push('/cart');
  };

  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail) {
      toast.error('Email is required');
      return;
    }
    setNotifyLoading(true);
    try {
      const res = await api.post(`/products/${product._id}/waitlist`, {
        email: notifyEmail,
        phone: notifyPhone
      });
      toast.success(res.data.message);
      setShowNotifyForm(false);
      setNotifyEmail('');
      setNotifyPhone('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setNotifyLoading(false);
    }
  };

  if (isReserved || isLocked) {
    if (showNotifyForm) {
      return (
        <motion.form 
          onSubmit={handleNotifySubmit}
          className="w-full flex flex-col gap-2 p-3 border border-black/10 bg-[#fbfbfa]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="text-[10px] uppercase font-bold tracking-widest text-black/60 mb-1 text-center">
            Get notified when it's back
          </div>
          <input
            type="email"
            required
            placeholder="Email Address *"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-black/10 focus:outline-none focus:border-black transition-colors"
          />
          <input
            type="tel"
            placeholder="WhatsApp Number (Optional)"
            value={notifyPhone}
            onChange={(e) => setNotifyPhone(e.target.value)}
            className="w-full p-2.5 text-xs bg-white border border-black/10 focus:outline-none focus:border-black transition-colors"
          />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowNotifyForm(false)}
              className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-black/10 text-black/60 hover:text-black hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={notifyLoading}
              className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {notifyLoading ? 'Wait...' : 'Notify Me'}
            </button>
          </div>
        </motion.form>
      );
    }

    return (
      <motion.button
        onClick={() => setShowNotifyForm(true)}
        className="w-full flex items-center justify-center gap-3 bg-black text-white font-display uppercase font-bold tracking-[0.15em] py-4 text-xs border border-black relative overflow-hidden group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <span className="relative flex items-center gap-3">
          <Lock size={14} />
          NOTIFY ME WHEN AVAILABLE
        </span>
      </motion.button>
    );
  }

  const isAlreadyInCart = (items || []).some(i => i._id === product._id);

  if (isAlreadyInCart) {
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
