'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
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
        className="w-full bg-paper border border-ink/15 px-3 py-1.5 text-xs focus:outline-none focus:border-brick font-sans"
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
    { href: '/dashboard', label: 'Dashboard', startMatch: false },
    { href: '/products',  label: 'Products',  startMatch: true  },
    { href: '/orders',    label: 'Orders',    startMatch: true  },
    { href: '/customers', label: 'Customers', startMatch: true  },
    { href: '/marketing', label: 'Marketing', startMatch: true  },
    { href: '/content',   label: 'Content',   startMatch: true  },
  ];

  return (
    <div className="bg-paper min-h-screen text-ink">
      <header className="bg-white text-ink sticky top-0 z-50 border-b border-ink/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png?v=2"
                alt="Octune Vintage"
                width={130}
                height={52}
                className="h-11 md:h-14 w-auto object-contain"
              />
              <span className="font-serif tracking-[0.25em] text-[10px] text-ink/40 uppercase hidden md:inline border-l border-ink/10 pl-3">Admin Portal</span>
            </Link>
            <nav className="hidden xl:flex items-center h-full gap-1">
              {navLinks.map(({ href, label, startMatch }) => {
                const isActive = startMatch ? pathname.startsWith(href) : pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 rounded-sm group"
                    style={{
                      color: isActive ? '#c0392b' : 'rgba(15,15,15,0.5)',
                      background: isActive ? 'rgba(192,57,43,0.08)' : 'transparent',
                      borderBottom: isActive ? '2px solid #c0392b' : '2px solid transparent',
                    }}
                  >
                    <span
                      className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(15,15,15,0.04)' }}
                    />
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em] font-bold text-ink">
            <GlobalSearch />
            <span className="hidden lg:inline-block text-ink/40 ml-4">Logged in as {admin.name}</span>
            <button onClick={handleLogout} className="flex items-center text-ink/60 hover:text-brick transition-colors border border-ink/15 hover:border-brick/40 px-4 py-2 rounded-sm bg-ink/5 hover:bg-brick/5">
              <LogOut size={13} className="mr-2" strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {children || <Outlet />}
      </main>
    </div>
  );
}
