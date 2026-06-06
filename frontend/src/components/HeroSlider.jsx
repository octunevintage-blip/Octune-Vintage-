'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider({ banners }) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full h-[45vh] sm:h-[60vh] md:h-[80vh] border-b border-vnv-gray/20">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
        className="w-full h-full hero-swiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full flex items-center justify-center bg-vnv-light-gray overflow-hidden group">
              {/* Optimized Responsive Next.js Image */}
              <Image 
                src={banner.image}
                alt={banner.title || "Banner"}
                fill
                priority={index === 0}
                className="object-cover object-center transition-transform duration-[10000ms] group-hover:scale-105"
                sizes="100vw"
              />
              
              {/* Dark Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/45 md:bg-black/30 z-[5]"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-4xl mx-auto">
                {banner.subtitle && (
                  <p className="font-sans text-vnv-white/80 text-[10px] sm:text-xs md:text-base mb-2 sm:mb-4 uppercase tracking-[0.3em] drop-shadow-lg transform translate-y-4 opacity-0 transition-all duration-1000 delay-300 swiper-slide-active:opacity-100 swiper-slide-active:translate-y-0">
                    {banner.subtitle}
                  </p>
                )}
                
                {banner.title && (
                  <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase text-vnv-white tracking-tight drop-shadow-2xl mb-4 sm:mb-8 transform translate-y-8 opacity-0 transition-all duration-1000 delay-500 swiper-slide-active:opacity-100 swiper-slide-active:translate-y-0 break-words max-w-[90vw]">
                    {banner.title}
                  </h1>
                )}
                
                {banner.linkUrl && banner.linkText && (
                  <Link 
                    href={banner.linkUrl} 
                    className="mt-2 sm:mt-4 bg-vnv-white text-vnv-black font-display uppercase tracking-widest px-5 py-2.5 sm:px-8 sm:py-4 text-[10px] sm:text-sm font-bold hover:bg-vnv-black hover:text-vnv-white transition-colors border-2 border-transparent hover:border-vnv-white transform translate-y-4 opacity-0 duration-1000 delay-700 swiper-slide-active:opacity-100 swiper-slide-active:translate-y-0"
                  >
                    {banner.linkText}
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-swiper .swiper-pagination-bullet {
          background: #fff;
          opacity: 0.5;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          color: #fff;
          opacity: 0.5;
          transition: opacity 0.3s;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          opacity: 1;
        }
        
        /* Animations triggered when slide becomes active */
        .swiper-slide-active .swiper-slide-active\\:opacity-100 {
          opacity: 1;
        }
        .swiper-slide-active .swiper-slide-active\\:translate-y-0 {
          transform: translateY(0);
        }
      `}} />
    </section>
  );
}
