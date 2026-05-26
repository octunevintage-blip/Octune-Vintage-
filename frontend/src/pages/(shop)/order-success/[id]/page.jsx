import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { CheckCircle2, MapPin, Phone, Calendar, ShoppingBag } from 'lucide-react';
import SuccessSound from '@/components/SuccessSound';

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
        <h1 className="font-display text-3xl mb-4">Order not found.</h1>
        <Link href="/shop" className="btn btn-outline inline-block">Back to Shop</Link>
      </div>
    );
  }

  // Calculate delivery date (approx 5 days from creation)
  const orderDate = new Date(order.createdAt || Date.now());
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 5);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  const savedAmount = order.pricing?.discount || 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <SuccessSound />
      
      <div className="bg-white border border-vnv-gray/20 shadow-xl overflow-hidden rounded-none">
        {/* Top Confirmation Header */}
        <div className="bg-emerald-50/60 border-b border-emerald-100 p-6 md:p-8 text-center relative">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
              <CheckCircle2 size={28} strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-emerald-800 tracking-wide uppercase">
            Order confirmed
          </h1>
          {savedAmount > 0 && (
            <p className="text-emerald-700 font-semibold mt-1.5 text-sm flex items-center justify-center gap-1">
              Saved {formatINR(savedAmount)} <span role="img" aria-label="party">🎉</span>
            </p>
          )}
          <p className="text-xs text-emerald-600/80 mt-1">Order #{order.orderNumber}</p>
        </div>

        {/* Shipping details */}
        <div className="p-6 md:p-8 border-b border-vnv-gray/15">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-vnv-gray mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-vnv-black" /> Delivery Address
          </h2>
          <div className="bg-vnv-light-gray/40 p-4 border border-vnv-gray/10">
            <p className="text-sm font-bold text-vnv-black">Deliver to {order.customer?.name}</p>
            <p className="text-sm text-vnv-gray mt-1.5 leading-relaxed">
              {order.shippingAddress?.line1}
              {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <div className="mt-3 pt-3 border-t border-vnv-gray/10 flex items-center gap-2 text-xs font-semibold text-vnv-gray">
              <Phone size={12} className="text-vnv-black" />
              <span>Contact Number - <strong className="text-vnv-black font-bold">{order.customer?.phone}</strong></span>
            </div>
          </div>
        </div>
        {/* Product details */}
        <div className="p-6 md:p-8 border-b border-vnv-gray/15">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-vnv-gray flex items-center gap-2">
              <ShoppingBag size={14} className="text-vnv-black" /> {order.products && order.products.length > 0 ? order.products.length : 1} {order.products && order.products.length > 1 ? 'Products' : 'Product'}
            </h2>
            <span className="text-[10px] font-bold text-brick uppercase tracking-wider bg-brick/10 px-2 py-0.5">Vintage Pieces</span>
          </div>
          
          <div className="space-y-4">
            {(order.products && order.products.length > 0 ? order.products : [order.product]).map((prod, index) => (
              <div key={prod.productId || index} className="flex gap-4 md:gap-6 bg-vnv-light-gray/25 p-4 border border-vnv-gray/10">
                {prod?.image && (
                  <div className="relative w-20 h-24 bg-white border border-vnv-gray/20 shadow-sm shrink-0">
                    <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-display text-sm md:text-base font-bold truncate text-vnv-black">{prod?.name}</h3>
                    <p className="text-xs text-vnv-gray mt-1 font-semibold">Size: {prod?.size} • Qty: 1</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Calendar size={12} className="text-vnv-gray shrink-0" />
                    <span className="text-xs text-vnv-gray">Delivery by <strong className="text-vnv-black font-bold">{deliveryDateStr}</strong></span>
                  </div>
                </div>
                <div className="text-right py-1">
                  <p className="text-sm font-bold text-vnv-black">{formatINR(prod?.price || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing details and Payment Method */}
        <div className="p-6 md:p-8 border-b border-vnv-gray/15 bg-vnv-light-gray/10">
          <div className="flex justify-between items-center text-sm font-semibold mb-3">
            <span className="text-vnv-gray uppercase text-xs tracking-wider">Payment Status</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
              order.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.payment?.status || 'paid'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-vnv-gray uppercase text-xs tracking-wider">Payment Method</span>
            <span className="text-vnv-black uppercase text-xs tracking-wider font-bold">
              {order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online / Razorpay'}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 justify-center bg-white">
          <Link href="/account?tab=orders" className="btn btn-primary text-xs flex-1 justify-center text-center">
            View Orders
          </Link>
          <Link href="/shop" className="btn btn-outline text-xs flex-1 justify-center text-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
