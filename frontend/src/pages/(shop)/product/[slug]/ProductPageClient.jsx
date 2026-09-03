'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils';
import AddToCartBtn from './AddToCartBtn';
import ProductGallery from './ProductGallery';
import { ChevronDown, Ruler, Palette, Tag, Shield, Layers, Info, Heart, Share2, ArrowLeft, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useAuthStore, useAuthModalStore, useActiveProductStore } from '@/lib/store';
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
  const router = useRouter();
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const isReserved = product.status === 'reserved' && product.reservedUntil && new Date(product.reservedUntil) > new Date();
  const isReservedByOther = isReserved && (!user || String(product.reservedBy) !== String(user?._id));

  const shuffleSuggestions = (pool = allSuggestions) => {
    if (!pool || pool.length === 0) return;
    setIsShuffling(true);
    const validPool = pool.filter(item => item._id !== product._id);
    const shuffled = [...validPool].sort(() => 0.5 - Math.random());
    setSimilarProducts(shuffled.slice(0, 4));
    setTimeout(() => setIsShuffling(false), 400);
  };

  // Meta Pixel ViewContent Tracking
  useEffect(() => {
    if (product?._id && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product._id],
        content_type: 'product',
        value: product.price || 0,
        currency: 'INR'
      });
    }
  }, [product?._id]);

  // Fetch similar & random products for recommendation
  useEffect(() => {
    async function loadSimilar() {
      try {
        const catQuery = product.category ? `category=${encodeURIComponent(product.category)}&` : '';
        const [catRes, genRes] = await Promise.allSettled([
          api.get(`/products?${catQuery}limit=20`),
          api.get('/products?limit=30')
        ]);
        
        let pool = [];
        if (catRes.status === 'fulfilled' && catRes.value?.data?.products) {
          pool = [...catRes.value.data.products];
        }
        if (genRes.status === 'fulfilled' && genRes.value?.data?.products) {
          const genItems = genRes.value.data.products;
          pool = [...pool, ...genItems.filter(g => !pool.some(p => p._id === g._id))];
        }

        const filteredPool = pool.filter(item => item._id !== product._id);
        setAllSuggestions(filteredPool);
        shuffleSuggestions(filteredPool);
      } catch (err) {
        console.error('Failed to load suggested products:', err);
      }
    }
    if (product?._id) {
      loadSimilar();
    }
  }, [product._id, product.category]);

  useEffect(() => {
    if (product) {
      useActiveProductStore.getState().setActiveProduct(product);
    }
    return () => {
      useActiveProductStore.getState().setActiveProduct(null);
    };
  }, [product]);

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
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-10 py-4 md:py-10 pb-10 md:pb-10">
      {/* Mobile Top Header Back Arrow */}
      <div className="lg:hidden mb-3 flex items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/80 bg-black/5 hover:bg-black/10 px-3.5 py-1.5 rounded-full transition-colors active:scale-95"
          title="Back"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span className="uppercase tracking-wider">Back</span>
        </button>
      </div>

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

            {/* CTA Button & Actions Row */}
            <motion.div
              id="inline-cta-container"
              className="flex flex-col gap-3 my-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <AddToCartBtn product={product} isLocked={isLocked || isSold} isReserved={isReservedByOther} />
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                    isInWishlist
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-black/10 hover:border-black text-black/60 hover:text-black bg-white'
                  }`}
                  style={{ borderRadius: '2px' }}
                  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={16} className={isInWishlist ? "fill-current" : ""} />
                  <span className="text-[10px] tracking-widest">{isInWishlist ? 'SAVED' : 'WISHLIST'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-2 border border-black/10 hover:border-black text-black/60 hover:text-black bg-white text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95"
                  style={{ borderRadius: '2px' }}
                  title="Share product"
                >
                  <Share2 size={16} />
                  <span className="text-[10px] tracking-widest">SHARE</span>
                </button>
              </div>
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
               Quality Assured
              </span>
              <span className="w-px h-3 bg-black/10" />
              <span className="flex items-center gap-1.5">
                <Layers size={11} />
                Only 1 piece available
              </span>
            </motion.div>

            {/* ─── Expandable Detail Sections ─── */}
            <div className="mt-8 space-y-0">

              {/* Size & Measurements Dropdown */}
              {hasMeasurements && (
                <DetailSection
                  title="Size & Measurements (Inches)"
                  icon={Ruler}
                  defaultOpen={true}
                  delay={0.56}
                >
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
                </DetailSection>
              )}

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

              {/* Product Details Dropdown */}
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

      {/* ─── Similar / Random Suggestions Section ─── */}
      {similarProducts.length > 0 && (
        <div id="recommendations-section" className="mt-12 md:mt-24 pt-10 border-t border-black/10 pb-48 md:pb-12">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider">
                YOU MIGHT ALSO LIKE
              </h2>
              <p className="text-xs text-black/40 uppercase tracking-[0.15em] font-medium mt-1">
                More handpicked 1-of-1 archive grails for you
              </p>
            </div>
            <button
              onClick={() => shuffleSuggestions()}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black/80 hover:text-black border border-black/20 hover:border-black px-3.5 py-2 rounded transition-all active:scale-95 bg-white shadow-sm"
              title="Shuffle random recommendations"
            >
              <RefreshCw size={13} className={`transition-transform duration-500 ${isShuffling ? 'rotate-180' : ''}`} />
              <span>SHUFFLE SUGGESTIONS</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {similarProducts.map(similar => (
              <ProductCard key={similar._id} product={similar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
