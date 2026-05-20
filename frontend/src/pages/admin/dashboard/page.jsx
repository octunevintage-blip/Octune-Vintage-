'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { Package, ShoppingBag, Banknote, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Dashboard...</div>;
  if (!stats) return <div className="text-center py-20">Failed to load stats.</div>;

  const statCards = [
    { title: 'Total Revenue', value: formatINR(stats.totalRevenue), icon: Banknote },
    { title: 'Orders Today', value: stats.ordersToday, icon: Clock },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: AlertCircle },
    { title: 'Available Pieces', value: stats.available, icon: Package },
    { title: 'Sold Pieces', value: stats.sold, icon: CheckCircle },
    { title: 'Orders Month', value: stats.ordersMonth, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl uppercase tracking-widest mb-10 pb-4 border-b border-ink/10">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 border border-ink/10 shadow-sm flex items-start space-x-4">
              <div className="bg-cream p-3 text-brick">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-ink/50 mb-1">{stat.title}</h3>
                <p className="font-serif text-3xl">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Widget */}
        <div className="bg-white p-6 border border-ink/10 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-ink/10">
            <h2 className="font-serif text-xl tracking-widest">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-brick hover:underline">View All</Link>
          </div>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map(order => (
                <div key={order._id} className="flex justify-between items-center p-3 border border-ink/5 bg-paper/30">
                  <div>
                    <p className="font-mono text-sm font-bold">{order?.orderNumber || 'Unknown'}</p>
                    <p className="text-xs text-ink/60">{order?.customer?.name || 'Unknown Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(order?.pricing?.total || 0)}</p>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/50 italic">No recent orders found.</p>
          )}
        </div>

        {/* Recently Archived (Sold) Widget */}
        <div className="bg-white p-6 border border-ink/10 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-ink/10">
            <h2 className="font-serif text-xl tracking-widest">Recently Archived (Sold)</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-widest text-brick hover:underline">Inventory</Link>
          </div>
          {stats.recentSales && stats.recentSales.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSales.map(product => (
                <div key={product._id} className="flex items-center gap-4 p-3 border border-ink/5 bg-paper/30">
                  <div className="relative w-12 h-16 bg-cream">
                    {product.images && product.images[0] && (
                      <Image src={product.images[0].url} fill className="object-cover" alt={product.name} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm uppercase tracking-wider">{product.name}</p>
                    <p className="text-xs text-ink/50 font-mono mt-1">
                      Archived: {new Date(product.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest bg-ink text-cream px-2 py-1">
                      SOLD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/50 italic">No recently sold items.</p>
          )}
        </div>
      </div>
    </div>
  );
}
