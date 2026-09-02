import { useState, useEffect } from 'react';
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

  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const inlineBtn = document.getElementById('inline-cta-container');
      const recs = document.getElementById('recommendations-section');
      if (!inlineBtn) {
        setShowStickyBar(true);
        return;
      }

      const inlineRect = inlineBtn.getBoundingClientRect();
      const recsRect = recs ? recs.getBoundingClientRect() : null;

      // Show sticky bar ONLY when main inline CTA has scrolled off-screen above
      // AND recommendations section has not entered the viewport
      const scrolledPastInline = inlineRect.bottom < 50;
      const reachedRecs = recsRect ? recsRect.top < window.innerHeight - 100 : false;

      if (scrolledPastInline && !reachedRecs) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        className="w-full flex items-center justify-center gap-3 bg-black text-white font-display uppercase font-bold tracking-[0.15em] py-4 text-xs border border-black relative overflow-hidden group my-3"
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

  const handleAddToCart = () => {
    if (!user) {
      open('signup');
      return;
    }
    if (isAlreadyInCart) {
      router.push('/cart');
    } else {
      addItem(product);
      toast.success('Added to cart');
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [product._id],
          content_type: 'product',
          value: product.price || 0,
          currency: 'INR'
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      open('signup');
      return;
    }
    useCartStore.getState().setBuyNowItem(product);
    router.push('/checkout?mode=buyNow');
  };

  return (
    <div className="hidden md:flex w-full gap-2.5 sm:gap-3 my-3">
      <motion.button
        onClick={handleAddToCart}
        className="flex-1 flex items-center justify-center gap-2 bg-white text-black border-2 border-black font-display uppercase font-bold tracking-[0.1em] py-3.5 sm:py-4 text-xs relative overflow-hidden group hover:bg-black/5 active:scale-[0.98] transition-all shadow-sm"
        style={{ borderRadius: '2px', backgroundColor: '#ffffff', color: '#000000' }}
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
        className="flex-1 flex items-center justify-center gap-2 bg-black text-white border-2 border-black font-display uppercase font-bold tracking-[0.1em] py-3.5 sm:py-4 text-xs relative overflow-hidden group hover:bg-black/90 active:scale-[0.98] transition-all shadow-sm"
        style={{ borderRadius: '2px', backgroundColor: '#000000', color: '#ffffff' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        <span className="relative flex items-center gap-2">
          <span>BUY NOW</span>
          <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </motion.button>
    </div>
  );
}
