'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, LayoutDashboard, ShoppingBag, Package, Users, Percent, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useHasMounted } from '@/hooks/useHasMounted';
import { Outlet, useLocation } from 'react-router-dom';

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], orders: [], customers: [] });
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const res = await api.get(`/admin/search?q=${encodeURIComponent(query)}`);
          setResults(res.data);
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setResults({ products: [], orders: [], customers: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const hasResults = results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0;

  return (
    <div ref={wrapperRef} className="relative hidden md:block w-64 ml-4">
      <input
        type="text"
        placeholder="Search orders, products, customers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.trim().length > 1) setIsOpen(true); }}
        className="w-full lg:w-96 bg-paper border border-ink/15 px-4 py-2 text-xs focus:outline-none focus:border-brick font-sans rounded-full"
      />
      {isOpen && (
        <div className="absolute top-full mt-1 w-[400px] right-0 bg-white border border-ink/10 shadow-2xl z-[100] max-h-[80vh] overflow-y-auto">
          {!hasResults ? (
            <div className="p-4 text-xs text-ink/50 uppercase tracking-widest text-center">No results found</div>
          ) : (
            <div className="py-2">
              {results.orders.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/40 bg-paper">Orders</div>
                  {results.orders.map(order => (
                    <div 
                      key={order._id}
                      onClick={() => { setIsOpen(false); router.push('/orders'); }}
                      className="px-3 py-2 hover:bg-cream/50 cursor-pointer border-b border-ink/5 last:border-0"
                    >
                      <div className="text-xs font-bold font-serif">{order.orderNumber}</div>
                      <div className="text-[10px] text-ink/60">Customer: {order.customer?.name} ({order.customer?.email})</div>
                    </div>
                  ))}
                </div>
              )}
              {results.products.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/40 bg-paper">Products</div>
                  {results.products.map(product => (
                    <div 
                      key={product._id}
                      onClick={() => { setIsOpen(false); router.push(`/products/${product._id}/edit`); }}
                      className="px-3 py-2 hover:bg-cream/50 cursor-pointer border-b border-ink/5 last:border-0"
                    >
                      <div className="text-xs font-bold">{product.name}</div>
                      <div className="text-[10px] text-ink/60 uppercase">Status: {product.status}</div>
                    </div>
                  ))}
                </div>
              )}
              {results.customers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/40 bg-paper">Customers</div>
                  {results.customers.map(customer => (
                    <div 
                      key={customer._id}
                      onClick={() => { setIsOpen(false); router.push('/customers'); }}
                      className="px-3 py-2 hover:bg-cream/50 cursor-pointer border-b border-ink/5 last:border-0"
                    >
                      <div className="text-xs font-bold">{customer.name}</div>
                      <div className="text-[10px] text-ink/60">{customer.email} • {customer.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === '/login') {
    return <div className="bg-paper min-h-screen">{children || <Outlet />}</div>;
  }

  if (!mounted) return <div className="bg-paper min-h-screen" />;

  if (!admin || !admin.token) {
    if (admin) {
      logout();
    }
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('API logout failed, clearing state locally:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', startMatch: false, icon: LayoutDashboard },
    { href: '/products',  label: 'Products',  startMatch: true,  icon: Package },
    { href: '/orders',    label: 'Orders',    startMatch: true,  icon: ShoppingBag },
    { href: '/customers', label: 'Customers', startMatch: true,  icon: Users },
    { href: '/marketing', label: 'Marketing', startMatch: true,  icon: Percent },
    { href: '/content',   label: 'Content',   startMatch: true,  icon: FileText },
  ];

  return (
    <div className="bg-paper min-h-screen text-ink flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-ink/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-ink/10">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png?v=2"
              alt="Octune Vintage"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button className="lg:hidden text-ink/50 hover:text-ink" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map(({ href, label, startMatch, icon: Icon }) => {
            const isActive = startMatch ? pathname.startsWith(href) : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group"
                style={{
                  color: isActive ? '#c0392b' : 'rgba(15,15,15,0.6)',
                  background: isActive ? 'rgba(192,57,43,0.06)' : 'transparent',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? 'text-brick' : 'text-ink/40 group-hover:text-ink/70 transition-colors'} />
                <span className="text-xs font-bold uppercase tracking-[0.15em]">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-ink/10">
          <div className="px-4 py-3 mb-2 rounded-lg bg-paper">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold mb-1">Logged in as</p>
            <p className="text-xs font-bold truncate">{admin.name}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 text-ink/60 hover:text-brick transition-colors border border-ink/15 hover:border-brick/40 px-4 py-3 rounded-lg hover:bg-brick/5 text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-20 sticky top-0 z-30 border-b border-ink/10 flex items-center justify-between px-4 lg:px-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 mr-2 text-ink/70 hover:text-ink"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <GlobalSearch />
          </div>
          
          {/* Top Right Stats/Info (Optional) */}
          <div className="hidden lg:block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">
              Octune Vintage Admin Portal
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
