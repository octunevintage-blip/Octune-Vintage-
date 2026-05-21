import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';

export default function ProductCard({ product, variant = 'default' }) {
  const isSold = product.status === 'sold';
  const isOutOfStock = product.status === 'out-of-stock';
  const isLocked = product.isLocked; // Backend will set this to true if dropAt > now
  
  if (variant === 'trending') {
    return (
      <Link href={`/product/${product.slug}`} className="group block relative w-full h-full" style={{ perspective: '1000px' }}>
        <div className="relative w-full aspect-[4/5] bg-vnv-light-gray overflow-hidden shadow-md transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-3 group-hover:rotate-x-[2deg] group-hover:rotate-y-[-2deg] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
          <Image 
            src={product.images[0]?.url || '/placeholder.jpg'} 
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 ${isSold || isOutOfStock ? 'opacity-50 grayscale' : ''}`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          
          {/* Dark Overlay gradient for hover (desktop only) */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Status Badges */}
          <div className="absolute top-0 left-0 flex flex-col gap-1 p-3 z-20">
            {isSold && (
              <span className="bg-vnv-black text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
                SOLD OUT
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-brick text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
                OUT OF STOCK
              </span>
            )}
            {isLocked && (
              <span className="bg-vnv-gray text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
                UPCOMING
              </span>
            )}
            {!isSold && !isOutOfStock && !isLocked && (
              <span className="bg-vnv-white text-vnv-black text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm border border-vnv-black/10">
                1-OF-1
              </span>
            )}
          </div>

          {/* Details appearing on hover (desktop only) */}
          <div className="hidden md:flex absolute bottom-0 left-0 w-full p-5 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] z-20 flex flex-col justify-end">
            <div className="text-[10px] uppercase font-display tracking-widest text-vnv-white/80 mb-1">
              {product.brand || product.category}
            </div>
            <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-vnv-white mb-2 line-clamp-2">
              {product.name}
            </h3>
            <div className="text-sm font-sans flex items-center space-x-2">
              <span className={`${isSold || isOutOfStock ? 'text-vnv-white/60 line-through' : 'text-vnv-white font-medium'}`}>
                {formatINR(product.price)}
              </span>
              {product.mrp > product.price && !isSold && (
                <span className="text-xs text-vnv-white/60 line-through">{formatINR(product.mrp)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details for mobile (visible below image) */}
        <div className="block md:hidden mt-3 space-y-1">
          <div className="text-[10px] uppercase font-display tracking-widest text-vnv-gray">
            {product.brand || product.category}
          </div>
          <h3 className="font-display text-sm font-bold uppercase leading-tight tracking-wide group-hover:underline decoration-2 underline-offset-4 line-clamp-2">
            {product.name}
          </h3>
          <div className="text-xs font-sans flex items-center space-x-2 pt-0.5">
            <span className={`${isSold || isOutOfStock ? 'text-vnv-gray line-through' : 'text-vnv-black font-semibold'}`}>
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && !isSold && (
              <span className="text-[10px] text-vnv-gray line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <Link href={`/product/${product.slug}`} className="group block relative">
      <div className="relative aspect-[4/5] bg-vnv-light-gray mb-4 overflow-hidden">
        <Image 
          src={product.images[0]?.url || '/placeholder.jpg'} 
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isSold || isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        {/* Status Badges - Stark Rectangular VNV Style */}
        <div className="absolute top-0 left-0 flex flex-col gap-1 p-3">
          {isSold && (
            <span className="bg-vnv-black text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
              SOLD OUT
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-brick text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
              OUT OF STOCK
            </span>
          )}
          {isLocked && (
            <span className="bg-vnv-gray text-vnv-white text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm">
              UPCOMING
            </span>
          )}
          {!isSold && !isOutOfStock && !isLocked && (
            <span className="bg-vnv-white text-vnv-black text-[10px] font-display uppercase tracking-widest px-3 py-1 shadow-sm border border-vnv-black/10">
              1-OF-1
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[10px] uppercase font-display tracking-widest text-vnv-gray">
          {product.brand || product.category}
        </div>
        <h3 className="font-display text-base font-bold uppercase leading-tight tracking-wide group-hover:underline decoration-2 underline-offset-4">
          {product.name}
        </h3>
        <div className="text-sm font-sans flex items-center space-x-2 pt-1">
          <span className={`${isSold || isOutOfStock ? 'text-vnv-gray line-through' : 'text-vnv-black font-medium'}`}>
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && !isSold && (
            <span className="text-xs text-vnv-gray line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
