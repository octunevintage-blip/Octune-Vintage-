import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, PhoneCall, User, ArrowRight } from 'lucide-react';
import { useCartStore, useAuthStore, useAuthModalStore, useActiveProductStore } from '@/lib/store';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/contact', label: 'Contact', icon: PhoneCall },
  { path: '/account', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isProductPage = location.pathname.startsWith('/product/');

  const { activeProduct } = useActiveProductStore();
  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();

  // Product page action handlers
  const isAlreadyInCart = activeProduct && (items || []).some(i => i._id === activeProduct._id);

  const handleAddToCart = () => {
    if (!activeProduct) return;
    if (!user) {
      openAuthModal('signup');
      return;
    }
    if (isAlreadyInCart) {
      navigate('/cart');
    } else {
      addItem(activeProduct);
      toast.success('Added to cart');
    }
  };

  const handleBuyNow = () => {
    if (!activeProduct) return;
    if (!user) {
      openAuthModal('signup');
      return;
    }
    useCartStore.getState().setBuyNowItem(activeProduct);
    navigate('/checkout?mode=buyNow');
  };

  // If on product page, render ADD TO CART & BUY NOW continuously floating above all elements
  if (isProductPage) {
    if (!activeProduct) return null;

    return (
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[999999]">
        <div 
          className="bg-white/95 backdrop-blur-2xl border-2 border-black rounded-full p-2 px-3 flex gap-2.5 items-center justify-between shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black border border-black font-display uppercase font-bold tracking-wider text-[11px] py-2.5 rounded-full active:scale-[0.98] transition-all shadow-sm"
          >
            <ShoppingBag size={13} strokeWidth={2.5} />
            <span>{isAlreadyInCart ? 'GO TO CART' : 'ADD TO CART'}</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white border border-black font-display uppercase font-bold tracking-wider text-[11px] py-2.5 rounded-full active:scale-[0.98] transition-all shadow-sm"
          >
            <span>BUY NOW</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // Regular pages: render 4 Nav Links
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[70]">
      <div 
        className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-full px-4 py-2 flex justify-between items-center w-full shadow-[0_15px_35px_rgba(0,0,0,0.15)]"
      >
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className="relative flex flex-col items-center justify-center w-16 h-16"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  initial={false}
                  animate={{ y: isActive ? -12 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="relative flex items-center justify-center w-12 h-12 z-10"
                >
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-black rounded-full"
                      style={{
                        boxShadow: '0 8px 20px -6px rgba(0,0,0,0.6), inset 0 -4px 8px rgba(255,255,255,0.25), inset 0 4px 8px rgba(0,0,0,0.5)'
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <link.icon 
                    size={22} 
                    strokeWidth={isActive ? 2 : 1.5} 
                    className={`relative z-20 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} 
                  />
                </motion.div>
                
                {/* Label text */}
                <motion.span 
                  initial={false}
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    y: isActive ? 0 : 10,
                    scale: isActive ? 1 : 0.8
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`text-[9px] font-bold tracking-widest uppercase absolute bottom-1 whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-black' : 'text-gray-400'}`}
                >
                  {link.label}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
