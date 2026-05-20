'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils';
import AddToCartBtn from './AddToCartBtn';
import ProductGallery from './ProductGallery';
import { ChevronDown, Ruler, Palette, Tag, Shield, Layers, Info } from 'lucide-react';

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
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 xl:gap-20 relative">

        {/* ─── Gallery ─── Left 42% (Max 520px) ─── */}
        <div className="w-full lg:w-[42%] xl:w-[38%] max-w-[520px] mx-auto lg:mx-0">
          <ProductGallery
            images={product.images}
            productName={product.name}
            isSold={isSold}
            isLocked={isLocked}
            dropAt={product.dropAt}
            hoursLeft={hoursLeft}
          />
        </div>

        {/* ─── Info Panel ─── Right 58% ─── */}
        <div className="w-full lg:w-[58%] xl:w-[62%]">
          <div className="sticky top-28 lg:pt-0">

            {/* Breadcrumb / Category Tag */}
            <motion.div
              className="mb-3"
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
              className="font-display text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight mb-5 leading-[1.1]"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {product.name}
            </motion.h1>

            {/* Price Section */}
            <motion.div
              className="flex items-baseline flex-wrap gap-3 mb-6"
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

            {/* Quick Attribute Pills */}
            <motion.div
              className="flex flex-wrap gap-2 mb-6"
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
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] bg-[#f7f7f5] text-black/60 px-3 py-2 border border-black/[0.04]"
                >
                  <span className="text-black/30">{attr.label}:</span>
                  <span className="text-black/80">{attr.value}</span>
                </div>
              ))}
              {product.color?.name && (
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] bg-[#f7f7f5] text-black/60 px-3 py-2 border border-black/[0.04]">
                  {product.color?.hex && (
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: product.color.hex }}
                    />
                  )}
                  <span className="text-black/30">Color:</span>
                  <span className="text-black/80">{product.color.name}</span>
                </div>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <AddToCartBtn product={product} isLocked={isLocked || isSold} />
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
                1 of 1 Piece
              </span>
            </motion.div>

            {/* ─── Expandable Detail Sections ─── */}
            <div className="mt-8 space-y-0">

              {/* Description */}
              <DetailSection
                title="Description"
                icon={Info}
                defaultOpen={true}
                delay={0.55}
              >
                <div className="text-sm text-black/60 whitespace-pre-wrap leading-relaxed pl-0.5">
                  {product.description}
                </div>
              </DetailSection>

              {/* Product Details */}
              <DetailSection
                title="Product Details"
                icon={Palette}
                defaultOpen={false}
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

              {/* Size & Measurements Table */}
              {hasMeasurements && (
                <DetailSection
                  title="Size & Measurements"
                  icon={Ruler}
                  defaultOpen={false}
                  delay={0.65}
                >
                  <p className="text-[10px] text-black/35 uppercase tracking-[0.12em] mb-3 font-medium">
                    All measurements in inches (approx)
                  </p>
                  <div className="overflow-hidden border border-black/[0.06]" style={{ borderRadius: '2px' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                            Measurement
                          </th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em]">
                            Size {product.size}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(measurementLabels).map(([key, label], idx) => {
                          const val = product.measurements[key];
                          if (!val) return null;
                          return (
                            <tr
                              key={key}
                              className={`${idx % 2 === 0 ? 'bg-white' : 'bg-black/[0.015]'} border-t border-black/[0.04]`}
                            >
                              <td className="px-4 py-2.5 uppercase tracking-[0.1em] text-[11px] font-medium text-black/40">
                                {label}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-sm text-black/80">
                                {val}"
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-black/30 mt-2 leading-relaxed">
                    * Measurements are taken flat. Vintage items may have minor variations.
                  </p>
                </DetailSection>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
