'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils';
import AddToCartBtn from './AddToCartBtn';
import ProductGallery from './ProductGallery';
import { ChevronDown, Ruler, Palette, Tag, Shield, Layers, Info, Heart, Share2 } from 'lucide-react';
import { useAuthStore, useAuthModalStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Accordion section component
function DetailSection({ title, icon: Icon, children, defaultOpen = false, delay = 0 }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="border-t border-black/[0.06]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black/80 group-hover:text-black transition-colors">
          {Icon && <Icon size={14} strokeWidth={2} className="text-black/40" />}
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown size={14} className="text-black/30" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="pb-5">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductPageClient({
  product,
  isSold,
  isLocked,
  hoursLeft,
  hasDiscount,
  discountPct,
  measurementLabels,
  hasMeasurements,
}) {
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      if (!user) {
        setIsInWishlist(false);
        return;
      }
      try {
        const res = await api.get('/wishlist');
        const items = res.data || [];
        const isPresent = items.some(item => item._id === product._id);
        setIsInWishlist(isPresent);
      } catch (err) {
        console.error('Error fetching wishlist status:', err);
      }
    }
    checkWishlist();
  }, [user, product._id]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to your wishlist');
      openAuthModal('login');
      return;
    }
    
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product._id}`);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this 1-of-1 vintage piece: ${product.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 relative">

        {/* ─── Gallery ─── Left 38% (Max 440px) ─── */}
        <div className="w-full lg:w-[38%] max-w-[440px] mx-auto lg:mx-0 flex-shrink-0">
          <ProductGallery
            images={product.images}
            productName={product.name}
            isSold={isSold}
            isLocked={isLocked}
            dropAt={product.dropAt}
            hoursLeft={hoursLeft}
          />
        </div>

        {/* ─── Info Panel ─── Right 62% ─── */}
        <div className="w-full lg:w-[62%]">
          <div className="sticky top-28 lg:pt-0 max-w-[500px]">

            {/* Breadcrumb / Category Tag */}
            <motion.div
              className="mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-black/40 bg-black/[0.03] px-3 py-1.5">
                <Tag size={10} />
                {product.brand || product.category}
                {product.era ? ` · ${product.era}` : ''}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight mb-3.5 leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {product.name}
            </motion.h1>

            {/* Price Section */}
            <motion.div
              className="flex items-baseline flex-wrap gap-2.5 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className={`text-2xl sm:text-3xl font-sans font-black tracking-tight ${
                isSold ? 'text-black/30 line-through' : 'text-black'
              }`}>
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-black/30 line-through font-medium">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] bg-black text-white px-2.5 py-1">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </motion.div>

            {product.shortDescription && (
              <motion.p
                className="text-xs text-black/60 tracking-wider mb-4 italic leading-relaxed uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.5 }}
              >
                {product.shortDescription}
              </motion.p>
            )}

            {/* Quick Attribute Pills */}
            <motion.div
              className="flex flex-wrap gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              {[
                { label: 'Size', value: product.size },
                { label: 'Condition', value: product.condition },
                { label: 'Material', value: product.material },
              ].filter(a => a.value).map((attr) => (
                <div
                  key={attr.label}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] bg-black/[0.02] text-black/60 px-3 py-1.5 border border-black/[0.04]"
                >
                  <span className="text-black/35">{attr.label}:</span>
                  <span className="text-black/85">{attr.value}</span>
                </div>
              ))}
              {product.color?.name && (
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] bg-black/[0.02] text-black/60 px-3 py-1.5 border border-black/[0.04]">
                  {product.color?.hex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: product.color.hex }}
                    />
                  )}
                  <span className="text-black/35">Color:</span>
                  <span className="text-black/85">{product.color.name}</span>
                </div>
              )}
            </motion.div>

            {/* Size & Measurements (Directly Visible above CTA) */}
            {hasMeasurements && (
              <motion.div
                className="mb-5 p-4 bg-[#fbfbfa] border border-black/[0.04]"
                style={{ borderRadius: '2px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Ruler size={13} className="text-black/60" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/80">
                    Size & Measurements (Inches)
                  </span>
                </div>
                <div className="divide-y divide-black/[0.05] border-t border-b border-black/[0.05] py-1 bg-white px-3" style={{ borderRadius: '2px' }}>
                  {Object.entries(measurementLabels).map(([key, label]) => {
                    const val = product.measurements[key];
                    if (!val) return null;
                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2 text-xs"
                      >
                        <span className="uppercase tracking-[0.08em] text-[10px] font-semibold text-black/40">
                          {label}
                        </span>
                        <span className="font-bold text-xs text-black/80">
                          {val}"
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-black/35 mt-2 leading-relaxed uppercase tracking-wider">
                  * Measurements are taken flat. Vintage items may have minor variations.
                </p>
              </motion.div>
            )}

            {/* CTA Button & Actions Row */}
            <motion.div
              className="flex items-stretch gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex-grow">
                <AddToCartBtn product={product} isLocked={isLocked || isSold} />
              </div>
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`px-4 flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                  isInWishlist
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-black/10 hover:border-black text-black/60 hover:text-black'
                }`}
                style={{ borderRadius: '2px' }}
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={16} className={isInWishlist ? "fill-current" : ""} />
              </button>
              <button
                onClick={handleShare}
                className="px-4 flex items-center justify-center border border-black/10 hover:border-black text-black/60 hover:text-black transition-all duration-200 active:scale-95"
                style={{ borderRadius: '2px' }}
                title="Share product"
              >
                <Share2 size={16} />
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-5 flex items-center gap-4 text-[10px] text-black/35 font-medium uppercase tracking-[0.1em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                Authenticity Guaranteed
              </span>
              <span className="w-px h-3 bg-black/10" />
              <span className="flex items-center gap-1.5">
                <Layers size={11} />
                Only 1 piece available
              </span>
            </motion.div>

            {/* ─── Expandable Detail Sections ─── */}
            <div className="mt-8 space-y-0">

              {product.description && (
                <DetailSection
                  title="Description"
                  icon={Info}
                  defaultOpen={true}
                  delay={0.58}
                >
                  <p className="text-xs text-black/70 leading-relaxed uppercase tracking-wider whitespace-pre-line font-medium">
                    {product.description}
                  </p>
                </DetailSection>
              )}

              {/* Product Details */}
              <DetailSection
                title="Product Details"
                icon={Palette}
                defaultOpen={true}
                delay={0.6}
              >
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Size', value: product.size },
                    { label: 'Color', value: product.color?.name, hex: product.color?.hex },
                    { label: 'Condition', value: product.condition },
                    { label: 'Material', value: product.material },
                    { label: 'Category', value: product.category },
                    { label: 'Era', value: product.era },
                  ].filter(d => d.value).map((detail) => (
                    <div key={detail.label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">
                        {detail.label}
                      </span>
                      <span className="text-sm font-semibold text-black/75 flex items-center gap-1.5">
                        {detail.hex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 inline-block"
                            style={{ backgroundColor: detail.hex }}
                          />
                        )}
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
