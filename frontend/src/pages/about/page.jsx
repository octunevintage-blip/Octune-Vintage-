import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAbout() {
      try {
        const res = await api.get('/content');
        if (res.data && res.data.about) {
          setAbout(res.data.about);
        }
      } catch (error) {
        console.error('Failed to load About Us content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-vnv-white text-vnv-black flex flex-col items-center justify-center pt-20">
        <div className="font-display text-2xl uppercase tracking-widest animate-pulse">LOADING OUR STORY...</div>
      </div>
    );
  }

  // Fallbacks
  const title = about?.title || 'About Us';
  const quote = about?.quote || `"Our best picks of your favourite brands! That’s pretty much what Octune Vintage is all about!"`;
  const image = about?.image || '/about_us_photo.png';
  const description = about?.description || `We’re a thrifted/second-hand clothing store from West Bengal, India, built around timeless fashion and sustainable shopping! At Octune, we curate pre-loved and vintage pieces that bring style, comfort, and a whole lot of personality to your wardrobe.\n\nThink vintage jackets, track tops, jerseys, T-shirts, shorts, pants, and honestly, anything cool we can get our hands on! We only stock one piece of each product. So when you add something to your cart, you know it’s gonna be one of a kind!\n\nNow, who’s behind Octune?\n\nMeet Rubai, the curator with all the right finds! He’s technically behind sourcing all these cool pieces that you guys fight over! He’s absolutely obsessed with anything retro; be it fashion, bikes or music! Every product is handpicked and checked carefully, because looking good is important, but quality matters just as much. We make sure each piece is sourced with authenticity checks and is in A1 condition.\n\nThen there’s Rupsa, the social media fairy! She’s the one who decides what goes into a drop and that all the displayed products are squeaky clean, sorted and ready to go! From managing the drops to making sure your parcel reaches you smoothly, she handles the behind-the-scenes chaos so your Octune experience feels seamless from start to finish.\n\nAlso let’s not forget our Minati didi! Our super sweet didi who sorts our inventory, irons the products and makes sure that what we display are up to the mark!\n\nAnd of course, we have Simba, our golden CEO. He may not pack orders or help the customers or handpick items or manage social media…wait a sec, why do we have him again? Oh.. he got the job with his absolute cuteness!`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-12 md:pt-10 md:pb-20 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left Column - Image with VNV Style solid drop shadow. Sticky and vertically centered on large screens */}
        <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-1/2 lg:-translate-y-1/2">
          <div className="relative w-full max-w-[420px] bg-vnv-light-gray border-4 border-vnv-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <img 
              src={image} 
              alt="About Octune Vintage curators" 
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-750 block"
            />
          </div>
        </div>

        {/* Right Column - Story text */}
        <div className="lg:col-span-7 space-y-6 text-vnv-dark-gray leading-relaxed text-sm sm:text-base font-sans">
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight mb-6 text-center font-bold text-vnv-black">{title}</h1>
          
          {quote && (
            <p className="text-xl sm:text-2xl italic text-vnv-black tracking-wide font-medium leading-snug border-l-4 border-vnv-black pl-4 py-2">
              {quote}
            </p>
          )}
          
          <div className="space-y-4">
            {description.split('\n\n').map((paragraph, idx) => {
              // Format short blocks or headers nicely
              const isHeader = paragraph.trim().endsWith('?') || paragraph.trim().toLowerCase().startsWith('now, who') || paragraph.trim().length < 40;
              return (
                <p key={idx} className={isHeader ? "font-display text-lg sm:text-xl font-bold text-vnv-black uppercase tracking-tight pt-4" : ""}>
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
