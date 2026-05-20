import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

async function getOrder(id) {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function OrderSuccessPage({ params }) {
  const order = await getOrder(params.id);

  if (!order) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="font-serif text-3xl mb-4">Order not found.</h1>
        <Link href="/shop" className="btn btn-outline inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20 max-w-3xl">
      <div className="bg-paper p-10 md:p-16 border border-ink/5 shadow-lg relative overflow-hidden text-center">
        {/* Vintage border decoration */}
        <div className="absolute inset-2 border border-ink/10 pointer-events-none"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <CheckCircle2 size={64} className="text-brick" strokeWidth={1} />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-widest mb-4">Order Confirmed</h1>
        <p className="text-ink/60 mb-10 text-sm md:text-base">Your 1-of-1 is on its way. We've sent a confirmation to <span className="font-medium text-ink">{order.customer.email}</span>.</p>
        
        <div className="border-y border-ink/10 py-8 mb-10 text-left flex flex-col md:flex-row items-center md:items-start justify-center gap-8">
          <div className="relative w-32 h-44 bg-white shadow-sm border border-ink/10 p-1 flex-shrink-0">
            <Image src={order.product.image} alt={order.product.name} fill className="object-cover" />
          </div>
          <div className="pt-2">
            <h3 className="font-serif text-2xl mb-2">{order.product.name}</h3>
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-4">{order.product.size} | {order.product.color}</p>
            <div className="space-y-1 text-sm text-ink/80">
              <p>Order #: <span className="font-medium font-serif tracking-wider">{order.orderNumber}</span></p>
              <p>Total Paid: <span className="font-medium">{formatINR(order.pricing.total)}</span></p>
            </div>
          </div>
        </div>

        <Link href="/shop" className="btn btn-primary inline-block uppercase tracking-widest text-sm">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
