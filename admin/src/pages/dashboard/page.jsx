'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { Package, ShoppingBag, Banknote, Clock, CheckCircle, AlertCircle, TrendingUp, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

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

  const downloadExcel = () => {
    if (!stats) return;

    // Create a new Workbook
    const wb = XLSX.utils.book_new();

    // 1. Dashboard Summary Sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Revenue (₹)', stats.totalRevenue],
      ['Orders Today', stats.ordersToday],
      ['Orders This Month', stats.ordersMonth],
      ['Pending Orders', stats.pendingOrders],
      ['Available Inventory', stats.available],
      ['Sold Pieces', stats.sold]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 22 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Recent Orders Sheet
    if (stats.recentOrders && stats.recentOrders.length > 0) {
      const ordersData = stats.recentOrders.map(o => ({
        'Order Number': o.orderNumber,
        'Customer Name': o.customer?.name || 'N/A',
        'Amount (₹)': o.pricing?.total || 0,
        'Status': o.status.toUpperCase(),
        'Date': new Date(o.createdAt).toLocaleDateString()
      }));
      const wsOrders = XLSX.utils.json_to_sheet(ordersData);
      wsOrders['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Recent Orders');
    }

    // 3. Recently Sold Items Sheet
    if (stats.recentSales && stats.recentSales.length > 0) {
      const salesData = stats.recentSales.map(p => ({
        'Product Name': p.name,
        'Status': p.status.toUpperCase(),
        'Date Archived': new Date(p.updatedAt).toLocaleDateString()
      }));
      const wsSales = XLSX.utils.json_to_sheet(salesData);
      wsSales['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSales, 'Recently Sold');
    }

    // Trigger Excel Download
    XLSX.writeFile(wb, `Octune_Vintage_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-4 border-b border-ink/10 gap-4">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Dashboard Overview</h1>
        <button 
          onClick={downloadExcel}
          className="flex items-center gap-2 bg-ink text-cream px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors"
        >
          <Download size={14} />
          Export to Excel
        </button>
      </div>
      
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
            <Link to="/orders" className="text-xs uppercase tracking-widest text-brick hover:underline">View All</Link>
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
            <Link to="/products" className="text-xs uppercase tracking-widest text-brick hover:underline">Inventory</Link>
          </div>
          {stats.recentSales && stats.recentSales.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSales.map(product => (
                <div key={product._id} className="flex items-center gap-4 p-3 border border-ink/5 bg-paper/30">
                  <div className="relative w-12 h-16 bg-cream">
                    {product.images && product.images[0] && (
                      <img src={product.images[0].url} className="w-full h-full object-cover" alt={product.name} />
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
