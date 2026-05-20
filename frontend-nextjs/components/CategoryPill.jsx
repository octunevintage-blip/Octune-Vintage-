'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/utils';

export default function CategoryPill() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';

  return (
    <div className="w-full flex justify-center py-8 relative z-40">
      <div className="flex items-center gap-1 bg-vnv-white/90 backdrop-blur-md border border-vnv-gray/30 p-2 rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.12)] overflow-x-auto max-w-[95vw] hide-scrollbar hover:-translate-y-1 transition-transform duration-300">
      <Link 
        href="/shop" 
        className={`px-6 py-2.5 text-[10px] md:text-xs font-display tracking-widest uppercase rounded-full whitespace-nowrap transition-colors ${currentCategory === 'All' ? 'bg-vnv-black text-vnv-white' : 'bg-transparent text-vnv-gray hover:text-vnv-black'}`}
      >
        All
      </Link>
      {CATEGORIES.map(cat => (
        <Link 
          key={cat} 
          href={`/shop?category=${cat}`}
          className={`px-6 py-2.5 text-[10px] md:text-xs font-display tracking-widest uppercase rounded-full whitespace-nowrap transition-colors ${currentCategory === cat ? 'bg-vnv-black text-vnv-white' : 'bg-transparent text-vnv-gray hover:text-vnv-black'}`}
        >
          {cat}
        </Link>
      ))}
      </div>
    </div>
  );
}
