'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Lock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGallery({ images, productName, isSold, isLocked, dropAt, hoursLeft }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const navigate = useCallback((newIndex) => {
    setDirection(newIndex > active ? 1 : -1);
    setActive(newIndex);
  }, [active]);

  const prev = () => navigate((active - 1 + images.length) % images.length);
  const next = () => navigate((active + 1) % images.length);

  const handleMouseMove = (e) => {
    if (isSold || isLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, scale: 1.04 }),
    center: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir) => ({ opacity: 0, scale: 0.97, transition: { duration: 0.35 } }),
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Main Image Container */}
      <div
        className="relative aspect-[3/4] bg-gradient-to-br from-[#f8f7f5] to-[#edecea] overflow-hidden group cursor-crosshair"
        style={{ borderRadius: '2px' }}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle inner border effect */}
        <div className="absolute inset-0 z-[5] pointer-events-none border border-black/[0.04]" style={{ borderRadius: '2px' }} />

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={images[active].url}
              alt={`${productName} - view ${active + 1}`}
              fill
              className={`object-cover transition-transform duration-700 ease-out ${
                isSold ? 'grayscale opacity-40' : ''
              }`}
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isZoomed && !isSold && !isLocked ? 'scale(2.5)' : 'scale(1)',
              }}
              priority={active === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Sold Overlay */}
        {isSold && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="backdrop-blur-sm bg-black/20 absolute inset-0" />
            <motion.div
              className="relative bg-black text-white font-display text-3xl md:text-5xl font-bold px-10 py-3 uppercase tracking-[0.15em] -rotate-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              SOLD OUT
            </motion.div>
            {hoursLeft > 0 && (
              <motion.div
                className="relative mt-5 flex items-center gap-2 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 border border-black"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Clock size={12} />
                PURGES IN {hoursLeft}H
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Locked / Upcoming Overlay */}
        {isLocked && !isSold && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="backdrop-blur-sm bg-white/30 absolute inset-0" />
            <motion.div
              className="relative flex items-center gap-3 bg-black/90 text-white text-xs uppercase font-bold tracking-[0.15em] px-6 py-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
            >
              <Lock size={14} />
              DROPS {new Date(dropAt).toLocaleString()}
            </motion.div>
          </motion.div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-md border border-black/5 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-md border border-black/5 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Image counter badge */}
        {images.length > 1 && (
          <div
            className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ borderRadius: '2px' }}
          >
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.publicId}
              onClick={() => navigate(i)}
              className={`relative flex-1 aspect-square overflow-hidden transition-all duration-300 ${
                i === active
                  ? 'ring-1 ring-black ring-offset-1'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{ borderRadius: '1px', maxWidth: '80px' }}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className={`object-cover ${isSold ? 'grayscale opacity-50' : ''}`}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
