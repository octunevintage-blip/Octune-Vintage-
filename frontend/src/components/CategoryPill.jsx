'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/utils';

export default function CategoryPill() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const currentSize = searchParams.get('size') || 'All';

  const SIZES = ['All', 'S', 'M', 'L', 'XL', 'XXL'];

  const getCategoryLink = (cat) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('page');
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  const getSizeLink = (sz) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (sz === 'All') {
      params.delete('size');
    } else {
      params.set('size', sz);
    }
    params.delete('page');
    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 pt-6 pb-3 relative z-40">
      {/* Category Pills */}
      <div className="flex items-center gap-1 bg-vnv-white/90 backdrop-blur-md border border-vnv-gray/30 p-2 rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.12)] overflow-x-auto max-w-[95vw] hide-scrollbar">
        <Link 
          href={getCategoryLink('All')}
          className={`px-5 py-2 text-[10px] md:text-xs font-display tracking-widest uppercase rounded-full whitespace-nowrap transition-colors ${currentCategory === 'All' ? 'bg-vnv-black text-vnv-white' : 'bg-transparent text-vnv-gray hover:text-vnv-black'}`}
        >
          All Apparel
        </Link>
        {CATEGORIES.map(cat => (
          <Link 
            key={cat} 
            href={getCategoryLink(cat)}
            className={`px-5 py-2 text-[10px] md:text-xs font-display tracking-widest uppercase rounded-full whitespace-nowrap transition-colors ${currentCategory === cat ? 'bg-vnv-black text-vnv-white' : 'bg-transparent text-vnv-gray hover:text-vnv-black'}`}
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}
