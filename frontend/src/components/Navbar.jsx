'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, User, LogIn, UserPlus, UserCircle } from 'lucide-react';
import { useCartStore, useAuthStore, useAuthModalStore } from '@/lib/store';
import { useState } from 'react';
import { useHasMounted } from '@/hooks/useHasMounted';

const NAV_LINKS = [
  { href: '/',        label: 'Home',       exact: true  },
  { href: '/shop',    label: 'Shop',       exact: false },
  { href: '/about',   label: 'About Us',   exact: false },
  { href: '/contact', label: 'Contact Us', exact: false },
];

export default function Navbar() {
  const { item } = useCartStore();
  const { user } = useAuthStore();
  const { open: openAuthModal } = useAuthModalStore();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useHasMounted();
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed w-full z-50 bg-vnv-white border-b border-vnv-gray/20 font-display uppercase tracking-widest text-sm">
        {/* Top Info Bar — Scrolling Marquee on Mobile, Static on Desktop */}
        

        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-vnv-black" onClick={() => setIsOpen(true)}>
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 lg:w-1/3 flex items-center ml-4 lg:ml-8">
            <Image
              src="/logo.png?v=2"
              alt="Octune Vintage"
              width={1925}
              height={921}
              className="w-auto object-contain h-[50px] md:h-[75px]"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center justify-center space-x-1 w-1/2">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3 py-1 transition-all duration-200 hover:text-vnv-black"
                  style={{
                    color: isActive ? '#111111' : '#999999',
                    fontWeight: isActive ? '700' : '500',
                    borderBottom: isActive ? '2px solid #111111' : '2px solid transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="flex items-center justify-end space-x-4 lg:space-x-6 lg:w-1/4">
            <button className="hidden md:block hover:text-vnv-gray transition-colors">
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
                  className="text-vnv-black hover:text-vnv-gray transition-colors text-[10px] font-bold tracking-[0.15em] uppercase"
                >
                  Sign Up
                </button>
              </div>
            )}



            <Link href="/cart" className="flex items-center hover:text-vnv-gray transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && item && (
                <span className="absolute -top-1 -right-2 bg-vnv-black text-vnv-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-sans">
                  1
                </span>
              )}
            </Link>
          </div>
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-vnv-black text-vnv-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-vnv-dark-gray transition-all"
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


          </div>
        </div>
      </div>
    </>
  );
}
