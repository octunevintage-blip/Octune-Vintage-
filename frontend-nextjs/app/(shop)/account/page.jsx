'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore, useAuthModalStore } from '@/lib/store';
import { useHasMounted } from '@/hooks/useHasMounted';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingBag, Ticket, Heart, HelpCircle, UserCircle,
  LogOut, Package, ChevronRight, Copy, Check, Trash2, ExternalLink,
  ChevronDown, Mail, Phone, MapPin, Loader2, ArrowRight
} from 'lucide-react';

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

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'help', label: 'Help Centre', icon: HelpCircle },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const FAQ_ITEMS = [
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking link via email. You can also check the tracking status in the Orders section of your account.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached. Contact us to initiate a return.' },
  { q: 'How long does shipping take?', a: 'Domestic orders are typically delivered within 5-7 business days. We ship via trusted courier partners with full tracking.' },
  { q: 'Are your products authentic?', a: 'Yes! Every piece is 100% authentic vintage. We source globally and verify authenticity before listing. Each item is a unique 1-of-1 find.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement, provided they haven\'t been shipped yet. Contact our support team for assistance.' },
  { q: 'Do you offer international shipping?', a: 'Currently, we ship within India only. International shipping will be available soon. Stay tuned!' },
];

export default function AccountPage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const { user, setUser, logout } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [addressForm, setAddressForm] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [saving, setSaving] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!user || !user.token) {
      if (user) logout();
      openAuthModal('login');
      router.push('/');
      return;
    }
    setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    const defaultAddr = user.addresses?.[0] || {};
    setAddressForm({
      line1: defaultAddr.line1 || '',
      line2: defaultAddr.line2 || '',
      city: defaultAddr.city || '',
      state: defaultAddr.state || '',
      pincode: defaultAddr.pincode || '',
    });

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }

    fetchData();
  }, [mounted, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, couponsRes, wishlistRes] = await Promise.allSettled([
        api.get('/orders/my-orders'),
        api.get('/coupons/active'),
        api.get('/wishlist'),
      ]);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
      if (couponsRes.status === 'fulfilled') setCoupons(couponsRes.value.data);
      if (wishlistRes.status === 'fulfilled') setWishlist(wishlistRes.value.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      setWishlist(res.data);
      toast.success('Removed from wishlist');
    } catch (err) { toast.error('Failed to remove'); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        addresses: user.addresses || []
      });
      setUser({ ...user, ...res.data });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message || 'Update failed'); }
    setSaving(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const updatedAddresses = [
        {
          label: 'Default',
          line1: addressForm.line1,
          line2: addressForm.line2,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          isDefault: true
        }
      ];
      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        addresses: updatedAddresses
      });
      setUser({ ...user, ...res.data });
      toast.success('Delivery address saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
    setSavingAddress(false);
  };

  if (!mounted || !user) return <div className="min-h-[60vh]" />;

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wider">My Account</h1>
        <p className="text-vnv-gray text-sm mt-1 font-sans">Welcome back, {user.name}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="border border-vnv-gray/20 bg-white sticky top-32">
            {/* User Card */}
            <div className="p-5 border-b border-vnv-gray/15">
              <div className="w-12 h-12 rounded-full bg-vnv-black text-vnv-white flex items-center justify-center text-lg font-bold uppercase mb-3">
                {user.name?.charAt(0) || 'U'}
              </div>
              <p className="font-bold text-sm tracking-wide">{user.name}</p>
              <p className="text-vnv-gray text-[11px] mt-0.5">{user.email}</p>
            </div>

            {/* Tabs */}
            <nav className="py-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`account-tab w-full text-left ${activeTab === id ? 'account-tab-active' : 'text-vnv-gray hover:text-vnv-black hover:bg-vnv-light-gray'}`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-vnv-gray/15">
              <button onClick={handleLogout} className="account-tab w-full text-left text-red-500 hover:text-red-700 hover:bg-red-50">
                <LogOut size={15} strokeWidth={1.8} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileTabOpen(!mobileTabOpen)}
            className="w-full flex items-center justify-between border border-vnv-gray/20 px-4 py-3 bg-white"
          >
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]">
              {currentTab && <currentTab.icon size={15} />}
              {currentTab?.label}
            </span>
            <ChevronDown size={16} className={`transition-transform ${mobileTabOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileTabOpen && (
            <div className="border border-t-0 border-vnv-gray/20 bg-white">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileTabOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2 ${activeTab === id ? 'bg-vnv-light-gray text-black' : 'text-vnv-gray hover:bg-vnv-light-gray'}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] flex items-center gap-2 text-red-500 border-t border-vnv-gray/15">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={24} className="animate-spin text-vnv-gray" />
            </div>
          ) : (
            <>
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
                      { label: 'Wishlist Items', value: wishlist.length, icon: Heart },
                      { label: 'Active Coupons', value: coupons.length, icon: Ticket },
                      { label: 'Member Since', value: new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: UserCircle },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="border border-vnv-gray/20 p-4 md:p-5 bg-white">
                        <Icon size={18} className="text-vnv-gray mb-2" strokeWidth={1.5} />
                        <p className="text-xl md:text-2xl font-bold">{value}</p>
                        <p className="text-[10px] text-vnv-gray uppercase tracking-[0.15em] mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <div className="border border-vnv-gray/20 bg-white">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-vnv-gray/15">
                      <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em]">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray hover:text-black flex items-center gap-1">
                        View All <ChevronRight size={12} />
                      </button>
                    </div>
                    {orders.length === 0 ? (
                      <div className="p-8 text-center">
                        <Package size={32} className="mx-auto text-vnv-gray/40 mb-3" strokeWidth={1} />
                        <p className="text-vnv-gray text-sm">No orders yet</p>
                        <Link href="/shop" className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-[0.15em] text-black hover:underline">
                          Start Shopping <ArrowRight size={12} />
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-vnv-gray/10">
                        {orders.slice(0, 3).map(order => (
                          <div key={order._id} className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              {order.product?.image && (
                                <div className="w-12 h-12 bg-vnv-light-gray shrink-0 relative overflow-hidden">
                                  <Image src={order.product.image} alt="" fill className="object-cover" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{order.product?.name || 'Product'}</p>
                                <p className="text-[10px] text-vnv-gray uppercase tracking-wider">#{order.orderNumber}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="border border-vnv-gray/20 bg-white">
                  <div className="px-5 py-4 border-b border-vnv-gray/15">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em]">Order History</h3>
                  </div>
                  {orders.length === 0 ? (
                    <div className="p-12 text-center">
                      <Package size={40} className="mx-auto text-vnv-gray/30 mb-4" strokeWidth={1} />
                      <p className="text-vnv-gray text-sm mb-4">You haven&apos;t placed any orders yet.</p>
                      <Link href="/shop" className="btn btn-primary text-xs">Shop Now</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-vnv-gray/10">
                      {orders.map(order => (
                        <div key={order._id} className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-xs text-vnv-gray uppercase tracking-wider">Order #{order.orderNumber}</p>
                              <p className="text-[10px] text-vnv-gray mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                                {order.status}
                              </span>
                              <span className="text-sm font-bold">{formatINR(order.pricing?.total || 0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {order.product?.image && (
                              <div className="w-16 h-16 bg-vnv-light-gray shrink-0 relative overflow-hidden">
                                <Image src={order.product.image} alt="" fill className="object-cover" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{order.product?.name}</p>
                              <p className="text-xs text-vnv-gray">Size: {order.product?.size} • {order.product?.color}</p>
                            </div>
                          </div>
                          {order.tracking?.url && (
                            <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-black hover:underline">
                              Track Order <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Coupons */}
              {activeTab === 'coupons' && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em]">Available Coupons</h3>
                    <p className="text-xs text-vnv-gray mt-1">Apply these at checkout for discounts</p>
                  </div>
                  {coupons.length === 0 ? (
                    <div className="border border-vnv-gray/20 bg-white p-12 text-center">
                      <Ticket size={40} className="mx-auto text-vnv-gray/30 mb-4" strokeWidth={1} />
                      <p className="text-vnv-gray text-sm">No active coupons right now. Check back soon!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {coupons.map(coupon => (
                        <div key={coupon._id} className="border border-vnv-gray/20 bg-white overflow-hidden">
                          <div className="bg-vnv-black text-vnv-white px-5 py-3 flex items-center justify-between">
                            <span className="text-lg font-bold tracking-wider">
                              {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest text-vnv-gray">Promo</span>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <code className="text-sm font-bold tracking-[0.2em] bg-vnv-light-gray px-3 py-1.5 border border-dashed border-vnv-gray/30">{coupon.code}</code>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-vnv-gray hover:text-black transition-colors"
                              >
                                {copiedCode === coupon.code ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div className="text-[10px] text-vnv-gray uppercase tracking-wider space-y-1">
                              {coupon.minOrderValue > 0 && <p>Min. order: {formatINR(coupon.minOrderValue)}</p>}
                              <p>Valid till: {new Date(coupon.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em]">My Wishlist</h3>
                    <p className="text-xs text-vnv-gray mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
                  </div>
                  {wishlist.length === 0 ? (
                    <div className="border border-vnv-gray/20 bg-white p-12 text-center">
                      <Heart size={40} className="mx-auto text-vnv-gray/30 mb-4" strokeWidth={1} />
                      <p className="text-vnv-gray text-sm mb-4">Your wishlist is empty</p>
                      <Link href="/shop" className="btn btn-primary text-xs">Explore Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlist.map(product => (
                        <div key={product._id} className="border border-vnv-gray/20 bg-white group">
                          <Link href={`/product/${product.slug || product._id}`} className="block relative aspect-[4/5] bg-vnv-light-gray overflow-hidden">
                            {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                            {product.isSold && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-xs uppercase tracking-widest">Sold</span></div>}
                          </Link>
                          <div className="p-3">
                            <p className="text-xs font-semibold truncate">{product.name}</p>
                            <p className="text-sm font-bold mt-1">{formatINR(product.price || 0)}</p>
                            <button
                              onClick={() => handleRemoveWishlist(product._id)}
                              className="flex items-center gap-1 mt-2 text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider font-bold"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Help Centre */}
              {activeTab === 'help' && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em]">Help Centre</h3>
                    <p className="text-xs text-vnv-gray mt-1">Find answers to common questions</p>
                  </div>
                  <div className="border border-vnv-gray/20 bg-white divide-y divide-vnv-gray/10">
                    {FAQ_ITEMS.map((faq, i) => (
                      <div key={i}>
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-vnv-light-gray/50 transition-colors"
                        >
                          <span className="text-sm font-semibold pr-4">{faq.q}</span>
                          <ChevronDown size={16} className={`shrink-0 text-vnv-gray transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaq === i && (
                          <div className="px-5 pb-4">
                            <p className="text-sm text-vnv-gray leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border border-vnv-gray/20 bg-white p-6">
                    <h4 className="font-display text-xs font-bold uppercase tracking-[0.15em] mb-3">Still Need Help?</h4>
                    <p className="text-sm text-vnv-gray mb-4">Our team is here to assist you with any questions.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/contact" className="btn btn-primary text-xs flex-1 justify-center">
                        <Mail size={14} className="mr-2" /> Contact Us
                      </Link>
                      <a href="mailto:support@octunevintage.com" className="btn btn-outline text-xs flex-1 justify-center">
                        <Mail size={14} className="mr-2" /> Email Support
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Edit Profile Form */}
                  <div className="border border-vnv-gray/20 bg-white p-6">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] mb-4">Edit Profile</h3>
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">Full Name</label>
                        <div className="relative">
                          <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vnv-gray" />
                          <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="input pl-10" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vnv-gray" />
                          <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="input pl-10" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vnv-gray" />
                          <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="input pl-10" placeholder="+91 XXXXX XXXXX" />
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="btn btn-primary text-xs w-full sm:w-auto disabled:opacity-50">
                        {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>

                  {/* Delivery Address Form */}
                  <div className="border border-vnv-gray/20 bg-white p-6">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] mb-4">Delivery Address</h3>
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">Address Line 1</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-[17px] text-vnv-gray" />
                          <input type="text" value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} className="input pl-10" placeholder="Street Address, P.O. Box, Company" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">Address Line 2 (Optional)</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-[17px] text-vnv-gray" />
                          <input type="text" value={addressForm.line2} onChange={e => setAddressForm({...addressForm, line2: e.target.value})} className="input pl-10" placeholder="Apartment, Suite, Unit, Building" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">City</label>
                          <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="input" placeholder="City" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">State</label>
                          <select 
                            value={addressForm.state} 
                            onChange={e => setAddressForm({...addressForm, state: e.target.value})} 
                            className="input cursor-pointer"
                            required
                          >
                            <option value="" disabled>Select State</option>
                            {INDIAN_STATES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-vnv-gray mb-1.5">PIN Code</label>
                        <input type="text" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="input" placeholder="6 Digit PIN Code" required />
                      </div>
                      <button type="submit" disabled={savingAddress} className="btn btn-primary text-xs w-full sm:w-auto disabled:opacity-50">
                        {savingAddress ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
