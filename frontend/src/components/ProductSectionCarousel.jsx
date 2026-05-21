'use client';
import React from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function ProductSectionCarousel({ title, products = [], viewAllLink = '/shop' }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24 container mx-auto px-4 md:px-8">
      {/* Header section with category/section title and View All link */}
      <div className="flex justify-between items-end mb-8 border-b-2 border-vnv-black pb-4">
        <h2 className="font-display text-2xl md:text-4xl font-bold uppercase tracking-wide">{title}</h2>
        <Link href={viewAllLink} className="font-display text-xs md:text-sm uppercase tracking-widest text-vnv-gray hover:text-vnv-black transition-colors">
          VIEW ALL
        </Link>
      </div>

      {/* Grid displaying 4 products on desktop and 2 products on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
        {products.map((product) => (
          <div key={product._id} className="h-full">
            <ProductCard product={product} variant="trending" />
          </div>
        ))}
      </div>
    </section>
  );
}
