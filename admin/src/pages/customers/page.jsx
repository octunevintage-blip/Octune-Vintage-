'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone, ShoppingBag, Calendar, Trash2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer? All their login data will be removed.')) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Customers...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-ink/10">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Customers Ledger</h1>
        <div className="text-xs uppercase tracking-widest text-ink/60 font-bold">
          Total Customers: {customers.length}
        </div>
      </div>
      
      <div className="bg-white border border-ink/10 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-paper uppercase tracking-widest text-xs text-ink/60 border-b border-ink/10">
            <tr>
              <th className="p-4 font-medium">Customer Info</th>
              <th className="p-4 font-medium">Contact Details</th>
              <th className="p-4 font-medium">Default Address</th>
              <th className="p-4 font-medium">Order History</th>
              <th className="p-4 font-medium">Joined Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {customers.map(customer => {
              const defaultAddress = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0] || customer.latestOrderAddress;
              return (
                <tr key={customer._id} className="hover:bg-cream/50 transition-colors">
                  <td className="p-4">
                    <div className="font-serif font-bold text-base text-ink">{customer.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-ink/80 text-xs mb-1">
                      <Mail size={12} className="text-ink/40" /> {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-ink/80 text-xs">
                        <Phone size={12} className="text-ink/40" /> {customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {defaultAddress ? (
                      <div className="text-xs text-ink/70 flex items-start gap-1.5">
                        <MapPin size={12} className="text-ink/40 mt-0.5 shrink-0" />
                        <div>
                          <div>{defaultAddress.line1} {defaultAddress.line2}</div>
                          <div>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-ink/40 italic">No address saved</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShoppingBag size={13} className="text-brick" />
                      {customer.totalOrders} {customer.totalOrders === 1 ? 'Order' : 'Orders'}
                    </div>
                    {customer.totalOrders > 0 && (
                      <div className="text-[10px] uppercase tracking-widest text-ink/50 mt-1">
                        Lifetime: {formatINR(customer.totalSpent)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs text-ink/60 flex items-center gap-1.5">
                    <Calendar size={13} className="text-ink/40" />
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(customer._id)}
                      className="p-2 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-ink/50 uppercase tracking-widest text-xs">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
