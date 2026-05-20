import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  const [recentFinds, setRecentFinds] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [recentRes, contentRes, couponsRes] = await Promise.allSettled([
          api.get('/products?limit=8'),
          api.get('/content'),
          api.get('/coupons/active')
        ]);

        if (recentRes.status === 'fulfilled' && recentRes.value?.data) {
          setRecentFinds(Array.isArray(recentRes.value.data.products) ? recentRes.value.data.products : []);
        }
        if (contentRes.status === 'fulfilled' && contentRes.value?.data) {
          setSiteContent(contentRes.value.data || null);
        }
        if (couponsRes.status === 'fulfilled' && couponsRes.value?.data) {
          const couponData = couponsRes.value.data;
          setActiveCoupons(Array.isArray(couponData) ? couponData : []);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vnv-white text-vnv-black flex flex-col items-center justify-center pt-20">
        <div className="font-display text-2xl uppercase tracking-widest animate-pulse">LOADING THE ARCHIVES...</div>
      </div>
    );
  }

  // Construct hero banners to display
  let heroBanners = Array.isArray(siteContent?.heroBanners) ? siteContent.heroBanners : [];
  if (heroBanners.length === 0) {
    // Fallback to old single hero format
    const oldHero = siteContent?.hero || { 
      title: 'OWN AN ICON', 
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop' 
    };
    heroBanners = [{
      image: oldHero.image,
      title: oldHero.title,
      subtitle: '',
      linkText: 'Shop The Archives',
      linkUrl: '/shop'
    }];
  }
  const banners = Array.isArray(siteContent?.splitBanners) ? siteContent.splitBanners : [
    { title: 'JACKETS', linkCategory: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
    { title: 'TRACKTOPS', linkCategory: 'Tracktops', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' }
  ];
  const customBanners = Array.isArray(siteContent?.customBanners) ? siteContent.customBanners : [];
  
  // Use admin-curated trending products if available, otherwise fallback to recent finds
  const trendingProductsToDisplay = (siteContent?.trendingProducts && Array.isArray(siteContent.trendingProducts) && siteContent.trendingProducts.length > 0) 
    ? siteContent.trendingProducts 
    : (Array.isArray(recentFinds) ? recentFinds : []);

  return (
    <div className="bg-vnv-white text-vnv-black overflow-hidden">
      <HomeClient />
      
      {/* Promotional Ad Bar — centered */}
      {Array.isArray(activeCoupons) && activeCoupons.length > 0 && (
        <div
          className="bg-vnv-black text-vnv-white border-b border-vnv-gray/30"
          style={{ paddingTop: '6px', paddingBottom: '6px' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4">
            {activeCoupons.map((coupon) => (
              <span
                key={coupon._id}
                className="inline-flex items-center gap-3 font-sans uppercase tracking-widest font-semibold"
                style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
              >
                <span
                  style={{
                    background: 'white',
                    color: 'black',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '2px 8px',
                    letterSpacing: '0.15em',
                    flexShrink: 0,
                  }}
                >
                  PROMO
                </span>
                USE CODE{' '}
                <span style={{ fontWeight: 900, textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>
                  {coupon.code}
                </span>
                {' — '}
                <span style={{ fontWeight: 900 }}>
                  {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                </span>
                {coupon.minOrderValue > 0
                  ? ` ON ORDERS ABOVE ₹${coupon.minOrderValue}`
                  : ' ON ANY ORDER'}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Full Width Auto-Scrolling Hero Banners */}
      <HeroSlider banners={heroBanners} />

      {/* What's Trending / Recent Finds Carousel */}
      <section className="mt-16 md:mt-24 container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-8 border-b-2 border-vnv-black pb-4">
          <h2 className="font-display text-2xl md:text-4xl font-bold uppercase tracking-wide">WHAT'S TRENDING</h2>
          <Link href="/shop" className="font-display text-xs md:text-sm uppercase tracking-widest text-vnv-gray hover:text-vnv-black transition-colors hidden md:block">
            VIEW ALL
          </Link>
        </div>
        
        {/* Horizontal scroll container */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-4 md:space-x-6 pb-12 pt-4 snap-x pl-1">
          {Array.isArray(trendingProductsToDisplay) && trendingProductsToDisplay.map(product => (
            <div key={product._id} className="min-w-[65vw] md:min-w-[240px] lg:min-w-[280px] snap-start shrink-0">
              <ProductCard product={product} variant="trending" />
            </div>
          ))}
          {/* View All Card */}
          <div className="min-w-[65vw] md:min-w-[240px] lg:min-w-[280px] snap-start shrink-0 flex items-center justify-center bg-vnv-light-gray border border-vnv-gray/20 group cursor-pointer aspect-[4/5] relative shadow-sm hover:shadow-xl transition-shadow duration-500">
            <Link href="/shop" className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl uppercase tracking-widest group-hover:underline decoration-2 underline-offset-4">EXPLORE MORE LOOKS</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Split Banners */}
      <section className="mt-8 md:mt-16 container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(banners) && banners.map((banner, i) => (
          <Link key={i} href={`/shop?category=${banner.linkCategory}`} className="relative h-[400px] md:h-[600px] bg-vnv-light-gray group overflow-hidden flex items-end p-8">
            <div className="absolute inset-0 bg-vnv-black/20 z-10 group-hover:bg-vnv-black/40 transition-colors duration-500"></div>
            <Image src={banner.image} fill className="object-cover grayscale" alt={banner.title} />
            <h3 className="relative z-20 font-display text-4xl font-bold text-vnv-white uppercase tracking-wider group-hover:translate-x-4 transition-transform duration-500">{banner.title}</h3>
          </Link>
        ))}
      </section>

      {/* Custom Banners */}
      {Array.isArray(customBanners) && customBanners.length > 0 && (
        <section className="mt-8 md:mt-16 container mx-auto px-4 md:px-8 flex flex-col gap-4">
          {customBanners.map((banner, i) => (
            <div key={i} className="relative w-full h-[300px] md:h-[500px] bg-vnv-light-gray group overflow-hidden flex flex-col items-center justify-center text-center p-8">
              <div className="absolute inset-0 bg-vnv-black/40 z-10 group-hover:bg-vnv-black/60 transition-colors duration-500"></div>
              {banner.image && <Image src={banner.image} fill className="object-cover grayscale" alt={banner.title || 'Banner'} />}
              
              <div className="relative z-20 max-w-2xl flex flex-col items-center">
                {banner.title && <h3 className="font-display text-3xl md:text-5xl font-bold text-vnv-white uppercase tracking-widest mb-4 group-hover:-translate-y-2 transition-transform duration-500">{banner.title}</h3>}
                {banner.subtitle && <p className="font-sans text-vnv-gray text-sm md:text-base mb-8 uppercase tracking-widest group-hover:-translate-y-2 transition-transform duration-500 delay-75">{banner.subtitle}</p>}
                {banner.linkUrl && banner.linkText && (
                  <Link href={banner.linkUrl} className="bg-vnv-white text-vnv-black font-display uppercase tracking-widest px-8 py-3 text-xs font-bold hover:bg-vnv-black hover:text-vnv-white transition-colors border-2 border-transparent hover:border-vnv-white group-hover:-translate-y-2 duration-500 delay-150">
                    {banner.linkText}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Community / Story */}
      <section className="mt-16 md:mt-24 bg-vnv-black text-vnv-white py-20 px-4 md:px-8 border-t-4 border-vnv-gray/30">
        <div className="container mx-auto flex flex-col items-center text-center">
          <h2 className="font-display text-3xl md:text-6xl font-bold uppercase tracking-wider mb-6">ONE PIECE. ONE OWNER.</h2>
          <p className="font-sans text-vnv-gray max-w-2xl text-lg mb-10 leading-relaxed">
            Curated vintage streetwear sourced globally. We do not restock. We do not carry multiple sizes. You are securing a 1-of-1 archive piece. 
          </p>
          <Link href="/about" className="btn bg-vnv-white text-vnv-black hover:bg-vnv-gray hover:border-vnv-gray font-bold">
            OUR STORY
          </Link>
        </div>
      </section>

    </div>
  );
}
