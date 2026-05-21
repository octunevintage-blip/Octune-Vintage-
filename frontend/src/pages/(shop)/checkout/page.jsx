'use client';

import { useState, useEffect } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { formatINR } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useHasMounted } from '@/hooks/useHasMounted';

export default function CheckoutPage() {
  const { item, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const mounted = useHasMounted();
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (mounted) {
      if (!user) {
        router.push('/shop');
        toast.error('Please sign up or log in to checkout.');
      } else if (!item) {
        router.push('/shop');
      }
    }
  }, [item, user, router, mounted]);

  // Don't render until client-side so zustand localStorage is ready
  if (!mounted) return null;
  if (!user || !item) return null;

  const subtotal = item.price;
  const shipping = (subtotal - discount) >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, subtotal });
      if (res.data.valid) {
        setDiscount(res.data.discount);
        toast.success('Coupon applied!');
      } else {
        setDiscount(0);
        toast.error(res.data.reason);
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const initPayment = (data) => {
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: process.env.NEXT_PUBLIC_STORE_NAME,
      description: "Vintage 1-of-1 Order",
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/payment/verify', {
            orderId: data.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
          
          if (verifyRes.data.success) {
            clearCart();
            router.push(`/order-success/${verifyRes.data.orderId}`);
          }
        } catch (error) {
          toast.error(error.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#B5432A",
      },
      modal: {
        ondismiss: () => {
          toast.error('Payment cancelled by user');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      toast.error(response.error.description || 'Payment failed');
    });
    rzp.open();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('Please accept the Terms & Conditions and Refund Policy to proceed.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        productId: item._id,
        customer: { name: formData.name, email: formData.email, phone: formData.phone },
        shippingAddress: {
          line1: formData.line1, line2: formData.line2,
          city: formData.city, state: formData.state, pincode: formData.pincode
        },
        couponCode: discount > 0 ? couponCode : undefined
      });
      initPayment(res.data);
    } catch (error) {
      toast.error(error.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest mb-12 text-center border-b border-ink/10 pb-6">Secure Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <form onSubmit={handleCheckout} className="space-y-10 order-2 lg:order-1">
            
            {/* Contact Info */}
            <section>
              <h2 className="font-serif text-xl uppercase tracking-widest mb-6">Contact Information</h2>
              <div className="space-y-4">
                <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="input" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="input" />
                  <input required type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} className="input" />
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section>
              <h2 className="font-serif text-xl uppercase tracking-widest mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <input required type="text" name="line1" placeholder="Address Line 1" onChange={handleChange} className="input" />
                <input type="text" name="line2" placeholder="Apartment, suite, etc. (optional)" onChange={handleChange} className="input" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" placeholder="City" onChange={handleChange} className="input" />
                  <input required type="text" name="state" placeholder="State" onChange={handleChange} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="pincode" placeholder="PIN Code" onChange={handleChange} className="input" />
                  <input disabled type="text" value="India" className="input text-ink/50 bg-ink/5" />
                </div>
              </div>
            </section>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start space-x-3 bg-paper p-4 border border-ink/10 rounded-sm">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-brick cursor-pointer"
                required
              />
              <label htmlFor="agree-terms" className="text-xs text-ink/75 leading-relaxed cursor-pointer select-none">
                I have read and agree to the website's{' '}
                <a href="/terms" target="_blank" className="text-brick font-semibold underline hover:no-underline">Terms & Conditions</a>
                ,{' '}
                <a href="/shipping" target="_blank" className="text-brick font-semibold underline hover:no-underline">Shipping Policy</a>
                , and{' '}
                <a href="/refund" target="_blank" className="text-brick font-semibold underline hover:no-underline">Refund Policy</a>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-lg py-5 text-lg">
              {loading ? 'Processing...' : `Pay ${formatINR(total)} securely`}
            </button>
            <p className="text-center text-xs text-ink/40 flex items-center justify-center space-x-2">
              <span>Payments processed securely via Razorpay</span>
            </p>
          </form>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="bg-paper p-8 border border-ink/5 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl uppercase tracking-widest mb-6 border-b border-ink/10 pb-4">Your Item</h2>
              
              <div className="flex items-center space-x-6 mb-8 border-b border-ink/10 pb-8">
                <div className="relative w-20 h-28 bg-white flex-shrink-0 border border-ink/10 p-1 shadow-sm">
                  <Image src={item.images?.[0]?.url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                  <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">{item.size} {item.color?.name ? `| ${item.color.name}` : ''}</p>
                  <p className="font-medium">{formatINR(item.price)}</p>
                </div>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex mb-8">
                <input 
                  type="text" 
                  placeholder="Discount code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-transparent border border-ink/20 px-4 py-2 w-full text-sm uppercase focus:outline-none focus:border-brick transition-colors"
                />
                <button type="submit" className="bg-ink text-cream px-6 text-xs uppercase tracking-widest hover:bg-brick transition-colors ml-2">Apply</button>
              </form>

              <div className="space-y-4 text-sm mb-6 border-b border-ink/10 pb-6">
                <div className="flex justify-between">
                  <span className="text-ink/60">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brick">
                    <span>Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink/60">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-serif text-3xl">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
