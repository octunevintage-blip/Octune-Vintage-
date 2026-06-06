'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Eye, ShieldAlert, Truck, RefreshCw, X, Receipt, CheckCircle, HelpCircle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    provider: 'India Post',
    number: '',
    url: 'https://www.indiapost.gov.in/_layouts/15/dop.tracking.ui/trackconsignment.aspx'
  });


  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?limit=100');
      setOrders(res.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Direct submit for normal statuses
  const submitStatusChange = async (id, status, extraData = {}) => {
    try {
      await api.put(`/orders/${id}/status`, { status, ...extraData });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Triggered when dropdown changes
  const handleStatusSelect = (order, newStatus) => {
    if (newStatus === 'shipped') {
      setTrackingOrder(order);
      setTrackingForm({
        provider: order.tracking?.provider || 'India Post',
        number: order.tracking?.number || '',
        url: order.tracking?.url || 'https://www.indiapost.gov.in/_layouts/15/dop.tracking.ui/trackconsignment.aspx'
      });
    } else {
      submitStatusChange(order._id, newStatus);
    }
  };

  // Submit tracking info modal
  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!trackingOrder) return;
    
    await submitStatusChange(trackingOrder._id, 'shipped', {
      tracking: trackingForm
    });
    setTrackingOrder(null);
  };


  // Auto-fill India Post URL when tracking number is entered
  const handleTrackingNumberChange = (val) => {
    setTrackingForm(prev => ({
      ...prev,
      number: val,
      url: prev.provider === 'India Post' 
        ? `https://www.indiapost.gov.in/_layouts/15/dop.tracking.ui/trackconsignment.aspx`
        : prev.url
    }));
  };

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Orders...</div>;

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-ink/10">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Order Ledger</h1>
        
        <div className="flex items-center space-x-4">
          <label className="text-xs uppercase tracking-widest text-ink/60">Filter Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-paper border border-ink/20 px-3 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-brick"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white border border-ink/10 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-paper uppercase tracking-widest text-xs text-ink/60 border-b border-ink/10">
            <tr>
              <th className="p-4 font-medium">Order #</th>
              <th className="p-4 font-medium">Customer & Address</th>
              <th className="p-4 font-medium">Product Detail</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Payment & Notes</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {filteredOrders.map(order => (
              <tr key={order._id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 font-serif font-bold">
                  {order.orderNumber}
                  <div className="text-[10px] text-ink/40 font-sans mt-0.5 font-normal">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-ink">{order.customer.name}</div>
                  <div className="text-xs text-ink/60 mt-0.5">{order.customer.phone}</div>
                  <div className="text-[11px] text-ink/50 mt-1 max-w-[200px] truncate" title={`${order.shippingAddress?.line1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.pincode}`}>
                    {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                  </div>
                </td>
                <td className="p-4">
                  {(order.products && order.products.length > 0 ? order.products : (order.product ? [order.product] : [])).map((prod, idx) => (
                    <div key={prod.productId || idx} className={idx > 0 ? "mt-2 pt-2 border-t border-ink/5" : ""}>
                      <div className="font-medium max-w-[180px] truncate" title={prod.name}>{prod.name || 'Product'}</div>
                      <div className="text-[11px] text-ink/50 mt-0.5">Size: {prod.size || 'N/A'}</div>
                    </div>
                  ))}
                  {(!order.products?.length && !order.product) && (
                     <div className="font-medium text-ink/50">No Product Info</div>
                  )}
                </td>
                <td className="p-4 font-serif font-semibold">{formatINR(order.pricing.total)}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-sm ${
                      order.payment.status === 'paid' ? 'border-green-500 text-green-700 bg-green-50' : 
                      order.payment.status === 'refunded' ? 'border-orange-500 text-orange-700 bg-orange-50' : 
                      'border-ink/30 text-ink/60 bg-paper'
                    }`}>
                      {order.payment.status}
                    </span>
                    {order.notes && (
                      <div className="text-[10px] text-brick max-w-[150px] truncate italic" title={order.notes}>
                        Note: {order.notes}
                      </div>
                    )}
                    {order.tracking?.number && (
                      <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                        📦 {order.tracking.provider}: {order.tracking.number}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusSelect(order, e.target.value)}
                    className="bg-paper border border-ink/20 px-2 py-1 text-xs uppercase tracking-widest focus:outline-none focus:border-brick"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleStatusSelect(order, 'shipped')}
                      className="inline-flex items-center gap-1 border border-blue-600 text-blue-600 px-2 py-1 text-[9px] uppercase tracking-widest hover:bg-blue-50 transition-colors"
                      title="Edit Tracking Info"
                    >
                      <Truck size={10} /> Edit Track
                    </button>
                  )}
                  <button 
                    onClick={() => window.open(`/admin/orders/invoice/${order._id}`, '_blank')}
                    className="bg-brick text-cream px-3 py-1 text-[9px] uppercase tracking-widest hover:bg-brick-dark"
                  >
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-ink/50 uppercase tracking-widest text-xs">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TRACKING MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-ink/20 shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setTrackingOrder(null)} 
              className="absolute top-4 right-4 text-ink/40 hover:text-ink"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Truck size={20} />
              <h3 className="font-serif text-lg uppercase tracking-wider">India Post & Shipping Details</h3>
            </div>
            <p className="text-xs text-ink/60 mb-4">
              Enter the consignment details for order <strong className="font-mono">{trackingOrder.orderNumber}</strong>. The customer will be able to track this directly from their account page.
            </p>
            
            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-ink/65 mb-1">Shipping Provider</label>
                <input 
                  type="text" 
                  value={trackingForm.provider}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="e.g. India Post"
                  className="w-full bg-paper border border-ink/15 p-2 text-xs focus:outline-none focus:border-brick"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-ink/65 mb-1">Consignment / Tracking Number</label>
                <input 
                  type="text" 
                  value={trackingForm.number}
                  onChange={(e) => handleTrackingNumberChange(e.target.value)}
                  placeholder="e.g. EM123456789IN"
                  className="w-full bg-paper border border-ink/15 p-2 text-xs font-mono focus:outline-none focus:border-brick"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-ink/65 mb-1">Tracking Portal Link (URL)</label>
                <input 
                  type="url" 
                  value={trackingForm.url}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="e.g. https://www.indiapost.gov.in"
                  className="w-full bg-paper border border-ink/15 p-2 text-xs focus:outline-none focus:border-brick"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setTrackingOrder(null)}
                  className="px-4 py-2 border border-ink/10 text-xs uppercase tracking-wider hover:bg-paper"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-brick text-cream text-xs uppercase tracking-wider hover:bg-brick-dark font-semibold"
                >
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
