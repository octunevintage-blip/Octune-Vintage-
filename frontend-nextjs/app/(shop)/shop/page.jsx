import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import CategoryPill from '@/components/CategoryPill';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

async function getProducts(searchParams) {
  try {
    const query = new URLSearchParams(searchParams).toString();
    const res = await api.get(`/products?${query}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { products: [], total: 0 };
  }
}

export default async function Shop({ searchParams }) {
  const { products, total } = await getProducts(searchParams);
  const currentCategory = searchParams.category || 'All';
  const currentSort = searchParams.sort || 'newest';

  return (
    <div className="bg-vnv-white text-vnv-black min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-20 bg-vnv-light-gray border-b border-vnv-gray/20"></div>}>
        <CategoryPill />
      </Suspense>

      <div className="container mx-auto px-4 md:px-8 py-12 flex-grow">
        
        {/* VNV Style Header */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b-4 border-vnv-black pb-6">
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight uppercase mb-2">
              {currentCategory === 'All' ? 'ALL APPAREL' : currentCategory.toUpperCase()}
            </h1>
            <p className="text-xs text-vnv-gray uppercase tracking-[0.2em] font-bold">
              {total} {total === 1 ? 'ITEM' : 'ITEMS'}
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 space-y-6 lg:space-y-0">
          
          {/* Sort */}
          <div className="flex items-center space-x-4 text-xs font-display tracking-widest uppercase">
            <span className="text-vnv-gray">SORT BY:</span>
            <div className="flex gap-4">
               <Link 
                href={`/shop?${new URLSearchParams({...searchParams, sort: 'newest'}).toString()}`}
                className={`pb-1 border-b-2 ${currentSort === 'newest' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                NEW IN
              </Link>
              <Link 
                href={`/shop?${new URLSearchParams({...searchParams, sort: 'price-asc'}).toString()}`}
                className={`pb-1 border-b-2 ${currentSort === 'price-asc' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                PRICE LOW
              </Link>
              <Link 
                href={`/shop?${new URLSearchParams({...searchParams, sort: 'price-desc'}).toString()}`}
                className={`pb-1 border-b-2 ${currentSort === 'price-desc' ? 'border-vnv-black text-vnv-black' : 'border-transparent text-vnv-gray hover:text-vnv-black'}`}
              >
                PRICE HIGH
              </Link>
            </div>
          </div>
        </div>

        {/* Grid - VNV uses stark grids with clear margins */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
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
