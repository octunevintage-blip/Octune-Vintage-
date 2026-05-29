import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CategoryPill from '@/components/CategoryPill';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/products?${query}`);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [searchParams]);

  // Helper to build links for sorting
  const getSortLink = (sortVal) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortVal);
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="bg-vnv-white text-vnv-black min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-20 bg-vnv-light-gray border-b border-vnv-gray/20"></div>}>
        <CategoryPill />
      </Suspense>

      <div className="container mx-auto px-4 md:px-8 pt-4 pb-12 flex-grow">
        
        {/* VNV Style Header */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b-4 border-vnv-black pb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight uppercase mb-2">
              {currentSearch 
                ? `Search: "${currentSearch.toUpperCase()}"` 
                : (currentCategory === 'All' ? 'ALL APPAREL' : currentCategory.toUpperCase())
              }
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
              <p className="text-xs text-vnv-gray uppercase tracking-[0.2em] font-bold">
                {total} {total === 1 ? 'ITEM' : 'ITEMS'} FOUND
              </p>
              {currentSearch && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    setSearchParams(params);
                  }}
                  className="text-xs text-brick hover:underline font-bold uppercase tracking-wider"
                >
                  (Clear Search)
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 space-y-6 lg:space-y-0">
          
          {/* Sort */}
          <div className="flex items-center space-x-4 text-xs font-display tracking-widest uppercase">
            <span className="text-vnv-gray">SORT BY:</span>
            <div className="flex gap-4">
              <Link 
                to={getSortLink('newest')}
                className={`pb-1 border-b-2 ${currentSort === 'newest' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                NEW IN
              </Link>
              <Link 
                to={getSortLink('price-asc')}
                className={`pb-1 border-b-2 ${currentSort === 'price-asc' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                PRICE LOW
              </Link>
              <Link 
                to={getSortLink('price-desc')}
                className={`pb-1 border-b-2 ${currentSort === 'price-desc' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                PRICE HIGH
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center bg-vnv-light-gray border border-vnv-gray/20">
            <h2 className="font-display text-2xl uppercase tracking-widest animate-pulse">LOADING ARCHIVES...</h2>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 space-x-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-6 py-2 border border-vnv-black text-xs font-bold uppercase tracking-widest hover:bg-vnv-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-vnv-black disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="font-mono text-sm uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-6 py-2 border border-vnv-black text-xs font-bold uppercase tracking-widest hover:bg-vnv-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-vnv-black disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-40 text-center bg-vnv-light-gray border border-vnv-gray/20">
            <h2 className="font-display text-4xl uppercase font-bold tracking-tight mb-2">NO ITEMS FOUND</h2>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-vnv-gray">The archives are empty for this selection.</p>
          </div>
        )}

      </div>
    </div>
  );
}
