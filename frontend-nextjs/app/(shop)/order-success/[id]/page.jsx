import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { CheckCircle2, Clock, MapPin, Phone, Calendar, ShoppingBag } from 'lucide-react';
import SuccessSound from '@/components/SuccessSound';
import TrackPurchase from '@/components/analytics/TrackPurchase';

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
  const isConfirmed = order.status === 'confirmed' || order.payment?.status === 'paid';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {isConfirmed && <SuccessSound />}
      <TrackPurchase order={order} />
      
      <div className="bg-white border border-vnv-gray/20 shadow-xl overflow-hidden rounded-none">
        {/* Top Header - Confirmed vs Pending */}
        {isConfirmed ? (
          <div className="bg-emerald-50/60 border-b border-emerald-100 p-6 md:p-8 text-center relative">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                <CheckCircle2 size={28} strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-emerald-800 tracking-wide uppercase">
              Order Confirmed
            </h1>
            {savedAmount > 0 && (
              <p className="text-emerald-700 font-semibold mt-1.5 text-sm flex items-center justify-center gap-1">
                Saved {formatINR(savedAmount)} <span role="img" aria-label="party">🎉</span>
              </p>
            )}
            <p className="text-xs text-emerald-600/80 mt-1">Order #{order.orderNumber}</p>
          </div>
        ) : (
          <div className="bg-amber-50/80 border-b border-amber-200 p-6 md:p-8 text-center relative">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-md">
                <Clock size={28} strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-amber-900 tracking-wide uppercase">
              Order Pending
            </h1>
            <p className="text-sm font-medium text-amber-800 mt-2 max-w-md mx-auto leading-relaxed">
              Order request received! Please complete payment with Admin on WhatsApp. Your order will be confirmed once payment is verified.
            </p>
            <div className="mt-4">
              <a
                href={`https://wa.me/918250689552?text=${encodeURIComponent(`Hi Octune Vintage! 👋 Here is my Order #${order.orderNumber}. I would like to complete my payment via UPI / Bank Transfer.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-none font-bold text-xs uppercase tracking-wider text-white shadow-md hover:brightness-105 transition-all"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                <span>Chat on WhatsApp to Pay &amp; Confirm</span>
              </a>
            </div>
            <p className="text-[11px] text-amber-700/80 mt-3 font-medium">Order #{order.orderNumber} • Awaiting Admin Confirmation</p>
          </div>
        )}

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
              <ShoppingBag size={14} className="text-vnv-black" /> 1 Product
            </h2>
            <span className="text-[10px] font-bold text-brick uppercase tracking-wider bg-brick/10 px-2 py-0.5">1-of-1 Item</span>
          </div>
          
          <div className="flex gap-4 md:gap-6 bg-vnv-light-gray/25 p-4 border border-vnv-gray/10">
            {order.product?.image && (
              <div className="relative w-20 h-24 bg-white border border-vnv-gray/20 shadow-sm shrink-0">
                <Image src={order.product.image} alt={order.product.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-display text-sm md:text-base font-bold truncate text-vnv-black">{order.product?.name}</h3>
                <p className="text-xs text-vnv-gray mt-1">Size: {order.product?.size} • Qty: 1</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Calendar size={12} className="text-vnv-gray shrink-0" />
                <span className="text-xs text-vnv-gray">Delivery by <strong className="text-vnv-black font-bold">{deliveryDateStr}</strong></span>
              </div>
            </div>
            <div className="text-right py-1">
              <p className="text-sm font-bold text-vnv-black">{formatINR(order.product?.price || 0)}</p>
            </div>
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
