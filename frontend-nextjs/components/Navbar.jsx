'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, User, LogIn, UserPlus, UserCircle, Shield, ArrowLeft } from 'lucide-react';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useHasMounted } from '@/hooks/useHasMounted';
import api from '@/lib/api';
import CountdownTimer from './CountdownTimer';

const NAV_LINKS = [
  { href: '/',             label: 'Home',        exact: true  },
  { href: '/shop',         label: 'Shop',        exact: false },
  { href: '/our-people',  label: 'Our People', exact: false },
  { href: '/about',        label: 'About Us',    exact: false },
  { href: '/contact',      label: 'Contact Us',  exact: false },
];

export default function Navbar() {
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useHasMounted();
  const pathname = usePathname();
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextDrop, setNextDrop] = useState(null);

  useEffect(() => {
    // Fetch global content to check if Next Drop timer is active
    const loadContent = async () => {
      try {
        const res = await api.get('/content');
        if (res.data?.nextDrop?.isActive) {
          setNextDrop(res.data.nextDrop);
        } else {
          setNextDrop(null);
        }
      } catch (err) {
        // ignore
      }
    };
    loadContent();
  }, [pathname]);

  // Sync search query with URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('search') || '');
    }
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    } else {
      router.push('/shop');
      setShowSearch(false);
    }
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    } else {
      router.push('/shop');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Search Overlay */}
      <div
        className={`fixed top-0 left-0 w-full bg-vnv-white border-b border-vnv-gray/20 z-[60] h-20 transition-all duration-300 transform ${
          showSearch ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center max-w-3xl mx-auto relative">
            <Search size={20} strokeWidth={1.5} className="absolute left-0 text-vnv-gray" />
            <input
              type="text"
              placeholder="SEARCH THE ARCHIVES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-8 pr-12 py-2 border-b border-vnv-black/10 focus:border-vnv-black text-sm uppercase tracking-wider font-display focus:outline-none placeholder-vnv-gray/50"
              autoFocus={showSearch}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 text-vnv-gray hover:text-vnv-black text-xs font-bold tracking-widest uppercase"
              >
                Clear
              </button>
            )}
          </form>
          <button
            onClick={() => setShowSearch(false)}
            className="p-2 text-vnv-gray hover:text-vnv-black font-display font-bold text-xs uppercase tracking-widest ml-4"
          >
            Close
          </button>
        </div>
      </div>

      <nav className="sticky top-0 w-full z-50 bg-vnv-white border-b border-vnv-gray/20 font-display uppercase tracking-widest text-sm shadow-sm transition-all">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">

          {/* Mobile Menu Toggle or Back Button */}
          {pathname.startsWith('/product/') ? (
            <button
              className="lg:hidden shrink-0 p-2 text-vnv-black -ml-2 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center"
              onClick={() => router.back()}
              title="Go back"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
          ) : (
            <button className="lg:hidden shrink-0 p-2 text-vnv-black -ml-2" onClick={() => setIsOpen(true)}>
              <Menu size={24} strokeWidth={1.5} />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center w-28 md:w-auto lg:w-[150px] xl:w-[200px]">
            <Image
              src="/logo.png"
              alt="Octune Vintage"
              width={1925}
              height={921}
              className="w-auto object-contain h-10 md:h-[60px]"
              priority
            />
          </Link>

          {/* Center Area: Nav Links & Timer */}
          <div className="flex-1 flex items-center justify-center gap-2 lg:gap-6 xl:gap-12 px-1 lg:px-4">
            
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center justify-center space-x-4 xl:space-x-8">
              {NAV_LINKS.map(({ href, label, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative py-1 transition-all duration-200 hover:text-vnv-black whitespace-nowrap text-[11px] xl:text-sm tracking-[0.15em] xl:tracking-widest"
                    style={{
                      color: isActive ? '#111111' : '#999999',
                      fontWeight: isActive ? '800' : '600',
                      borderBottom: isActive ? '2px solid #111111' : '2px solid transparent',
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Inline Timer widget */}
            {nextDrop && nextDrop.targetDate && (
              <div className="flex shrink-0 items-center justify-center">
                <CountdownTimer targetDate={nextDrop.targetDate} title={nextDrop.title} />
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="shrink-0 flex items-center justify-end space-x-3 lg:space-x-5 w-auto">
            <button 
              onClick={() => setShowSearch(true)} 
              className="hidden md:block hover:text-vnv-gray transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Auth: Show user icon + Account link or login/signup */}
            {mounted && user ? (
              <Link href="/account" className="hidden md:flex items-center gap-2 hover:text-vnv-gray transition-colors group">
                <div className="w-8 h-8 rounded-full bg-vnv-black text-vnv-white flex items-center justify-center text-[11px] font-bold uppercase tracking-wider group-hover:bg-vnv-dark-gray transition-colors">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase group-hover:text-vnv-black transition-colors">
                  Account
                </span>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-vnv-gray hover:text-vnv-black transition-colors text-[10px] font-bold tracking-[0.15em] uppercase"
                >
                  Login
                </button>
                <span className="text-vnv-gray/40 text-[10px]">|</span>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-vnv-black hover:text-vnv-gray transition-colors text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Admin Profile / Login link - Desktop */}
            <Link
              href="/admin/login"
              className="hidden md:flex items-center gap-1.5 text-vnv-gray hover:text-vnv-black transition-colors"
              title="Admin Login"
            >
              <Shield size={18} strokeWidth={1.5} />
            </Link>

            <Link href="/cart" className="flex items-center hover:text-vnv-gray transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && items && items.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-vnv-black text-vnv-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-sans">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
        {/* Mobile Search Bar below Nav Icons */}
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-vnv-gray/10 bg-vnv-white">
          <form onSubmit={handleMobileSearchSubmit} className="relative flex items-center">
            <Search size={18} strokeWidth={1.5} className="absolute left-3 text-vnv-gray" />
            <input
              type="text"
              placeholder="SEARCH THE ARCHIVES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vnv-light-gray pl-10 pr-12 py-2 text-xs uppercase tracking-wider font-display border border-transparent focus:border-vnv-black focus:outline-none rounded-md shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-vnv-gray hover:text-vnv-black text-[10px] font-bold tracking-widest uppercase"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-vnv-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-vnv-white shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-vnv-gray/20 flex justify-between items-center">
            <span className="font-display text-xl font-bold tracking-widest">MENU</span>
            <button onClick={() => setIsOpen(false)} className="p-2">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>



          {/* Mobile User Section */}
          {mounted && (
            <div className="px-4 py-4 border-b border-vnv-gray/20">
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-vnv-black text-vnv-white flex items-center justify-center text-sm font-bold uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-vnv-black tracking-wide">{user.name}</p>
                    <p className="text-[10px] text-vnv-gray uppercase tracking-[0.15em]">View Account</p>
                  </div>
                </Link>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsOpen(false); openAuthModal('login'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-vnv-black text-vnv-black text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-vnv-black hover:text-vnv-white transition-all"
                  >
                    <LogIn size={14} />
                    Login
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); openAuthModal('signup'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-vnv-black text-vnv-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-vnv-dark-gray transition-all whitespace-nowrap"
                  >
                    <UserPlus size={14} />
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col p-4 space-y-1 font-display text-base uppercase tracking-widest">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 rounded-sm transition-all duration-200"
                  style={{
                    color: isActive ? '#111111' : '#999999',
                    fontWeight: isActive ? '700' : '500',
                    background: isActive ? 'rgba(15,15,15,0.06)' : 'transparent',
                    borderLeft: isActive ? '3px solid #111111' : '3px solid transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {/* Account link in mobile menu */}
            {mounted && user && (
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 rounded-sm transition-all duration-200"
                style={{
                  color: pathname.startsWith('/account') ? '#111111' : '#999999',
                  fontWeight: pathname.startsWith('/account') ? '700' : '500',
                  background: pathname.startsWith('/account') ? 'rgba(15,15,15,0.06)' : 'transparent',
                  borderLeft: pathname.startsWith('/account') ? '3px solid #111111' : '3px solid transparent',
                }}
              >
                My Account
              </Link>
            )}

            <div className="border-t border-vnv-gray/20 pt-4 mt-2">
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-vnv-gray hover:text-vnv-black transition-colors"
              >
                <Shield size={16} strokeWidth={1.5} />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
