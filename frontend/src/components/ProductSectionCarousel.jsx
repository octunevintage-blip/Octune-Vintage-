'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function ProductSectionCarousel({ title, subtitle, products = [], viewAllLink = '/shop' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="mt-16 md:mt-24 container mx-auto px-4 md:px-8">
      {/* Header section with category/section title and View All link */}
      <div className="flex justify-between items-end mb-8 border-b-2 border-vnv-black pb-4">
        <div>
          <h2 className="font-display text-2xl md:text-4xl font-bold uppercase tracking-wide">{title}</h2>
          {subtitle && (
            <p className="font-sans text-xs md:text-sm text-vnv-gray mt-1 tracking-wider">{subtitle}</p>
          )}
        </div>
        <Link to={viewAllLink} className="font-display text-xs md:text-sm uppercase tracking-widest text-vnv-gray hover:text-vnv-black transition-colors shrink-0">
          VIEW ALL
        </Link>
      </div>

      {/* Grid displaying paginated products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
        {paginatedProducts.map((product) => (
          <div key={product._id} className="h-full">
            <ProductCard product={product} variant="trending" />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-6">
          <button
            disabled={currentPage === 1}
            onClick={handlePrev}
            className="px-6 py-2 border border-vnv-black text-xs font-bold uppercase tracking-widest hover:bg-vnv-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-vnv-black disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="font-mono text-sm uppercase tracking-widest">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={handleNext}
            className="px-6 py-2 border border-vnv-black text-xs font-bold uppercase tracking-widest hover:bg-vnv-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-vnv-black disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
