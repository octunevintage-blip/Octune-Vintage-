'use client';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();
  const router = useRouter();

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-40 text-center max-w-xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 uppercase tracking-tight">YOUR CART IS EMPTY.</h1>
        <p className="text-vnv-gray mb-10 text-xs font-bold uppercase tracking-[0.2em]">Our archives await. Find your 1-of-1 piece.</p>
        <Link href="/shop" className="btn btn-primary">
          EXPLORE NOW
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((acc, curr) => acc + curr.price, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (!user) {
      openAuthModal('signup');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-12 border-b-4 border-vnv-black pb-4">SHOPPING CART</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
        <div className="lg:col-span-2">
          <div className="hidden md:grid grid-cols-6 gap-4 border-b-2 border-vnv-black pb-4 mb-6 text-[10px] uppercase tracking-[0.2em] font-bold text-vnv-gray">
            <div className="col-span-3">PRODUCT</div>
            <div className="text-center">DETAILS</div>
            <div className="text-right">PRICE</div>
            <div></div>
          </div>
          
          <div className="flex flex-col gap-6">
            {items.map((item) => (
              <div key={item._id} className="flex flex-col md:grid md:grid-cols-6 gap-6 items-center border-b border-vnv-gray/30 pb-8 relative group">
                <div className="w-full md:col-span-3 flex items-center space-x-6">
                  <div className="relative w-24 h-32 bg-vnv-light-gray flex-shrink-0 border border-vnv-gray/20">
                    <Image src={item.images?.[0]?.url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl mb-1 hover:underline decoration-2 underline-offset-4">
                      <Link href={`/product/${item.slug}`}>{item.name}</Link>
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-vnv-gray">{item.category}</p>
                  </div>
                </div>
                
                <div className="w-full md:col-span-1 text-left md:text-center text-xs font-bold space-y-1">
                  <p><span className="md:hidden text-[10px] uppercase tracking-[0.2em] text-vnv-gray mr-2">SIZE:</span>{item.size}</p>
                  {item.color?.name && <p><span className="md:hidden text-[10px] uppercase tracking-[0.2em] text-vnv-gray mr-2">COLOR:</span>{item.color.name}</p>}
                </div>
                
                <div className="w-full md:col-span-1 text-left md:text-right font-bold text-lg">
                  <span className="md:hidden text-[10px] uppercase tracking-[0.2em] text-vnv-gray mr-2 font-bold">PRICE:</span>
                  {formatINR(item.price)}
                </div>

                <div className="absolute top-0 right-0 md:relative md:col-span-1 flex justify-end">
                  <button onClick={() => removeItem(item._id)} className="text-vnv-gray hover:text-vnv-black transition-colors p-2" title="Remove item">
                    <X size={24} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-vnv-light-gray p-8 border-2 border-vnv-black sticky top-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight mb-6 border-b-2 border-vnv-black pb-4">ORDER SUMMARY</h3>
            
            <div className="space-y-4 text-sm font-bold mb-6 border-b-2 border-vnv-black pb-6">
              <div className="flex justify-between">
                <span className="text-vnv-gray">SUBTOTAL</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-vnv-gray">SHIPPING</span>
                <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 font-display font-bold text-3xl">
              <span>TOTAL</span>
              <span>{formatINR(total)}</span>
            </div>

            <button onClick={handleProceedToCheckout} className="w-full bg-vnv-black text-vnv-white font-display uppercase font-bold tracking-widest py-4 hover:bg-vnv-gray transition-colors border-2 border-vnv-black hover:border-vnv-gray">
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
