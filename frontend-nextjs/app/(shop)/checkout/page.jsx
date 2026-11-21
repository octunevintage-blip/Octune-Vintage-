'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { formatINR } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useHasMounted } from '@/hooks/useHasMounted';
import { ArrowLeft, X } from 'lucide-react';
import { trackInitiateCheckout } from '@/lib/metaPixel';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

export default function CheckoutPage() {
  const { items, clearCart, buyNowItem, clearBuyNowItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const mounted = useHasMounted();
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [savedAddress, setSavedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const fetchedRef = useRef(false);
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (mounted) {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('mode');
      const isBuyNow = mode === 'buyNow';
      if (isBuyNow) setIsBuyNowMode(true);

      const currentItems = isBuyNow && buyNowItem ? [buyNowItem] : items;

      if (!user) {
        router.push('/shop');
        toast.error('Please sign up or log in to checkout.');
      } else if (!currentItems || currentItems.length === 0) {
        router.push('/shop');
      } else {
        // Track InitiateCheckout once per checkout visit
        if (!initiatedRef.current) {
          initiatedRef.current = true;
          const totalVal = currentItems.reduce((acc, item) => acc + (item.price || 0), 0);
          trackInitiateCheckout({
            items: currentItems,
            totalValue: totalVal,
            currency: 'INR',
          });
        }

        if (!fetchedRef.current) {
          fetchedRef.current = true;
          // Fetch fresh user profile details from the database
          api.get('/auth/me')
            .then(res => {
              const freshUser = res.data;
              const defaultAddr = freshUser.addresses?.[0];
            const hasAddress = defaultAddr && (defaultAddr.line1 || defaultAddr.city || defaultAddr.state || defaultAddr.pincode);
            
            const addressData = hasAddress ? {
              line1: defaultAddr.line1 || '',
              line2: defaultAddr.line2 || '',
              city: defaultAddr.city || '',
              state: defaultAddr.state || '',
              pincode: defaultAddr.pincode || '',
            } : {
              line1: '',
              line2: '',
              city: '',
              state: '',
              pincode: '',
            };

            setFormData({
              name: freshUser.name || '',
              email: freshUser.email || '',
              phone: freshUser.phone || '',
              ...addressData
            });

            if (hasAddress) {
              setSavedAddress(defaultAddr);
              setUseSavedAddress(true);
            }
          })
          .catch(err => {
            console.error('Failed to fetch user profile:', err);
            // Fallback to local storage user
            const defaultAddr = user.addresses?.[0];
            const hasAddress = defaultAddr && (defaultAddr.line1 || defaultAddr.city || defaultAddr.state || defaultAddr.pincode);
            const addressData = hasAddress ? {
              line1: defaultAddr.line1 || '',
              line2: defaultAddr.line2 || '',
              city: defaultAddr.city || '',
              state: defaultAddr.state || '',
              pincode: defaultAddr.pincode || '',
            } : {
              line1: '',
              line2: '',
              city: '',
              state: '',
              pincode: '',
            };

            setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              ...addressData
            });

            if (hasAddress) {
              setSavedAddress(defaultAddr);
              setUseSavedAddress(true);
            }
          });

        api.get('/coupons/active')
          .then(res => setAvailableCoupons(res.data))
          .catch(err => console.error('Failed to fetch coupons:', err));
        }
      }
    }
  }, [items, buyNowItem, user, router, mounted]);

  const handleToggleSavedAddress = (checked) => {
    setUseSavedAddress(checked);
    if (checked && savedAddress) {
      setFormData(prev => ({
        ...prev,
        line1: savedAddress.line1 || '',
        line2: savedAddress.line2 || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        pincode: savedAddress.pincode || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
      }));
    }
  };

  // Don't render until client-side so zustand localStorage is ready
  if (!mounted) return null;
  const checkoutItems = isBuyNowMode && buyNowItem ? [buyNowItem] : items;
  if (!user || !checkoutItems || checkoutItems.length === 0) return null;

  const subtotal = checkoutItems.reduce((acc, curr) => acc + curr.price, 0);
  const shipping = (subtotal - discount) >= 999 ? 0 : 99;
  const total = Math.max(subtotal - discount + shipping, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { 
        code: couponCode, 
        subtotal,
        email: formData.email,
        phone: formData.phone 
      });
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
            if (isBuyNowMode) clearBuyNowItem();
            else clearCart();
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
    rzp.on('payment.failed', () => {
      setPaymentFailed(true);
    });
    rzp.open();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('Please accept the Terms & Conditions to proceed.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        productIds: checkoutItems.map(i => i._id),
        customer: { name: formData.name, email: formData.email, phone: formData.phone },
        shippingAddress: {
          line1: formData.line1, line2: formData.line2,
          city: formData.city, state: formData.state, pincode: formData.pincode
        },
        couponCode: discount > 0 ? couponCode : undefined,
        paymentMethod: paymentMethod
      });
      
      if (paymentMethod === 'cod') {
        if (isBuyNowMode) clearBuyNowItem();
        else clearCart();
        router.push(`/order-success/${res.data.orderId}`);
      } else {
        initPayment(res.data);
      }
    } catch (error) {
      setPaymentFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Octune Vintage! 👋 My online payment just failed at checkout. I'd like to complete my order worth ${formatINR(total)}. Can you please help me pay and confirm the order?`
  );
  const whatsappUrl = `https://wa.me/918250689552?text=${whatsappMessage}`;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="group flex items-center space-x-2 text-ink/60 hover:text-ink transition-colors mb-6 text-xs uppercase tracking-widest font-semibold"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        <h1 className="font-display text-3xl md:text-4xl uppercase tracking-widest mb-12 text-center border-b border-ink/10 pb-6">Secure Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <form onSubmit={handleCheckout} className="space-y-10 order-2 lg:order-1">
            
            {/* Contact Info */}
            <section>
              <h2 className="font-display text-xl uppercase tracking-widest mb-6">Contact Information</h2>
              <div className="space-y-4">
                <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="input" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="input" />
                  <input required type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="input" />
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-xl uppercase tracking-widest">Shipping Address</h2>
                {savedAddress && (
                  <label className="flex items-center space-x-2 text-xs font-semibold text-ink/75 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={useSavedAddress} 
                      onChange={(e) => handleToggleSavedAddress(e.target.checked)} 
                      className="accent-brick h-4 w-4 cursor-pointer"
                    />
                    <span>Use Saved Profile Address</span>
                  </label>
                )}
              </div>
              <div className="space-y-4">
                <input required type="text" name="line1" placeholder="Address Line 1" value={formData.line1} onChange={handleChange} className="input" disabled={useSavedAddress} />
                <input type="text" name="line2" placeholder="Apartment, suite, etc. (optional)" value={formData.line2} onChange={handleChange} className="input" disabled={useSavedAddress} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="input" disabled={useSavedAddress} />
                  <select 
                    required 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className="input cursor-pointer"
                    disabled={useSavedAddress}
                  >
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleChange} className="input" disabled={useSavedAddress} />
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
                {' '}and{' '}
                <a href="/shipping" target="_blank" className="text-brick font-semibold underline hover:no-underline">Shipping Policy</a>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-lg py-5 text-base uppercase tracking-widest font-semibold">
              {loading ? 'Processing...' : `Pay ${formatINR(total)} securely`}
            </button>
            <p className="text-center text-xs text-ink/40 flex items-center justify-center space-x-2">
              <span>Payments processed securely via Razorpay</span>
            </p>
          </form>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="bg-paper p-8 border border-ink/5 shadow-sm sticky top-24">
              <h2 className="font-display text-xl uppercase tracking-widest mb-6 border-b border-ink/10 pb-4">Your Items ({checkoutItems.length})</h2>
              
              <div className="max-h-[320px] overflow-y-auto space-y-6 mb-8 border-b border-ink/10 pb-8 pr-2">
                {checkoutItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-6">
                    <div className="relative w-16 h-20 bg-white flex-shrink-0 border border-ink/10 p-1 shadow-sm">
                      <Image src={item.images?.[0]?.url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-display text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">{item.size} {item.color?.name ? `| ${item.color.name}` : ''}</p>
                      <p className="font-medium text-sm">{formatINR(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplyCoupon} className="flex mb-4">
                <input 
                  type="text" 
                  placeholder="Discount code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-transparent border border-ink/20 px-4 py-2 w-full text-sm uppercase focus:outline-none focus:border-brick transition-colors"
                />
                <button type="submit" className="bg-ink text-cream px-6 text-xs uppercase tracking-widest hover:bg-brick transition-colors ml-2">Apply</button>
              </form>

              {availableCoupons.length > 0 && (
                <div className="mb-8 border border-ink/10 bg-white p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-2">Available Coupons</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {availableCoupons.map(coupon => (
                      <button
                        key={coupon._id}
                        type="button"
                        onClick={() => setCouponCode(coupon.code)}
                        className="w-full text-left p-2 border border-dashed border-ink/20 hover:border-brick hover:bg-cream transition-colors group flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono text-xs font-bold text-ink">{coupon.code}</span>
                          <span className="text-[10px] text-ink/60 block mt-0.5">
                            {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`} 
                            {coupon.minOrderValue > 0 && ` on orders above ₹${coupon.minOrderValue}`}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-brick opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="flex justify-between items-center font-display text-3xl">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Failed WhatsApp Modal */}
      {paymentFailed && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentFailed(false); }}
        >
          <div className="bg-white max-w-sm w-full rounded-2xl p-8 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setPaymentFailed(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h2 className="font-display text-xl uppercase tracking-widest mb-2 text-gray-900">Payment Failed</h2>
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              Online payments are temporarily unavailable due to a technical issue on our end.
            </p>
            <p className="text-sm font-semibold text-gray-700 mb-6">
              Please contact us on WhatsApp — our team will personally help you complete your order! 🙏
            </p>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 w-full py-4 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              <span>Chat with Admin on WhatsApp</span>
            </a>

            <p className="text-xs text-gray-400 mt-4">
              We'll confirm your order &amp; arrange payment personally 💚
            </p>
          </div>
        </div>
      )}
    </>
  );
}
