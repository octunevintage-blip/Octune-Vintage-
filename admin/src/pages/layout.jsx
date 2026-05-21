'use client';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import api from '@/lib/api';
import { useHasMounted } from '@/hooks/useHasMounted';

import { Outlet } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useHasMounted();

  if (pathname === '/login') {
    return <div className="bg-paper min-h-screen">{children || <Outlet />}</div>;
  }

  // Don't check auth until client-side (zustand persist uses localStorage)
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
    { href: '/marketing', label: 'Marketing', startMatch: true  },
    { href: '/content',   label: 'Content',   startMatch: true  },
  ];

  return (
    <div className="bg-paper min-h-screen text-ink">
      {/* Admin Topbar */}
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
            <nav className="hidden md:flex items-center h-full gap-1">
              {navLinks.map(({ href, label, startMatch }) => {
                const isActive = startMatch ? pathname.startsWith(href) : pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 rounded-sm group"
                    style={{
                      color: isActive ? '#c0392b' : 'rgba(15,15,15,0.5)',
                      background: isActive ? 'rgba(192,57,43,0.08)' : 'transparent',
                      borderBottom: isActive ? '2px solid #c0392b' : '2px solid transparent',
                    }}
                  >
                    {/* Hover background */}
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
            <span className="hidden lg:inline-block text-ink/40">Logged in as {admin.name}</span>
            <button onClick={handleLogout} className="flex items-center text-ink/60 hover:text-brick transition-colors border border-ink/15 hover:border-brick/40 px-4 py-2 rounded-sm bg-ink/5 hover:bg-brick/5">
              <LogOut size={13} className="mr-2" strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {children || <Outlet />}
      </main>
    </div>
  );
}
