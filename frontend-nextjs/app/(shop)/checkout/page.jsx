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
import { ArrowLeft } from 'lucide-react';

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
  const { items, clearCart } = useCartStore();
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
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [savedAddress, setSavedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (mounted) {
      if (!user) {
        router.push('/shop');
        toast.error('Please sign up or log in to checkout.');
      } else if (!items || items.length === 0) {
        router.push('/shop');
      } else if (!fetchedRef.current) {
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
      }
    }
  }, [items, user, router, mounted]);

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
  if (!user || !items || items.length === 0) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.price, 0);
  const shipping = (subtotal - discount) >= 999 ? 0 : 99;
  const codTotal = subtotal - discount + shipping;
  const onlineTotal = Math.max(subtotal - discount - 30 + shipping, 0);
  const total = paymentMethod === 'razorpay' ? onlineTotal : codTotal;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      toast.error('Please accept the Terms & Conditions to proceed.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payment/create-order', {
        productIds: items.map(i => i._id),
        customer: { name: formData.name, email: formData.email, phone: formData.phone },
        shippingAddress: {
          line1: formData.line1, line2: formData.line2,
          city: formData.city, state: formData.state, pincode: formData.pincode
        },
        couponCode: discount > 0 ? couponCode : undefined,
        paymentMethod: paymentMethod
      });
      
      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/order-success/${res.data.orderId}`);
      } else {
        initPayment(res.data);
      }
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
              <h2 className="font-display text-xl uppercase tracking-widest mb-6 border-b border-ink/10 pb-4">Your Items ({items.length})</h2>
              
              <div className="max-h-[320px] overflow-y-auto space-y-6 mb-8 border-b border-ink/10 pb-8 pr-2">
                {items.map((item) => (
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
                {paymentMethod === 'razorpay' && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>UPI/Online Discount</span>
                    <span>-₹30</span>
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
    </>
  );
}
