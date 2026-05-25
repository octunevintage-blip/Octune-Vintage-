'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Percent, Send } from 'lucide-react';

export default function MarketingDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrderValue: 0,
    maxDiscount: '',
    usageLimit: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const [customForm, setCustomForm] = useState({
    email: '',
    phone: '',
    type: 'flat',
    value: '',
    reason: ''
  });
  const [sendingCustom, setSendingCustom] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      toast.success('Coupon created successfully');
      fetchCoupons();
      setFormData({ ...formData, code: '', value: '' }); // Reset main fields
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleSendCustom = async (e) => {
    e.preventDefault();
    setSendingCustom(true);
    try {
      await api.post('/marketing/personalized-coupon', customForm);
      toast.success('Custom coupon generated and sent successfully');
      setCustomForm({ email: '', phone: '', type: 'flat', value: '', reason: '' });
      fetchCoupons(); // Refresh to show new coupon
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send custom coupon');
    } finally {
      setSendingCustom(false);
    }
  };

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Marketing Data...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b border-ink/10 pb-4">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Marketing & Promos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Coupon Form */}
        <div className="bg-white p-6 border border-ink/10 shadow-sm h-fit">
          <h2 className="font-serif text-xl tracking-widest mb-6 flex items-center gap-2">
            <Plus size={20} className="text-brick" /> Create Coupon
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Coupon Code</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border border-ink/20 bg-paper uppercase font-mono text-sm focus:outline-none focus:border-brick"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="e.g. ARCHIVE20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Type</label>
                <select 
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-brick"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="percent">Percentage %</option>
                  <option value="flat">Flat Amount ₹</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Value</label>
                <input 
                  type="number" 
                  required min="1"
                  className="w-full p-2 border border-ink/20 bg-paper font-mono text-sm focus:outline-none focus:border-brick"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder={formData.type === 'percentage' ? "20" : "500"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Valid From</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-brick"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Valid To</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-brick"
                  value={formData.validTo}
                  onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Total Usage Limit (Total times it can be used)</label>
              <input 
                type="number" 
                required min="1"
                className="w-full p-2 border border-ink/20 bg-paper font-mono text-sm focus:outline-none focus:border-brick"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-brick text-cream py-3 uppercase tracking-widest text-xs font-bold hover:bg-brick-dark mt-4">
              Generate Coupon
            </button>
          </form>
        </div>

        {/* Custom Apology / Issue Coupon Form */}
        <div className="bg-white p-6 border border-ink/10 shadow-sm h-fit lg:col-span-2">
          <h2 className="font-serif text-xl tracking-widest mb-2 flex items-center gap-2">
            <Send size={20} className="text-blue-600" /> Send Personalized Coupon
          </h2>
          <p className="text-xs text-ink/60 mb-6 tracking-widest uppercase">Target a specific customer via Email & WhatsApp</p>
          <form onSubmit={handleSendCustom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Customer Email *</label>
                <input 
                  type="email" 
                  required
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-blue-600"
                  value={customForm.email}
                  onChange={(e) => setCustomForm({...customForm, email: e.target.value})}
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" 
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-blue-600"
                  value={customForm.phone}
                  onChange={(e) => setCustomForm({...customForm, phone: e.target.value})}
                  placeholder="+91..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Discount Type</label>
                <select 
                  className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-blue-600"
                  value={customForm.type}
                  onChange={(e) => setCustomForm({...customForm, type: e.target.value})}
                >
                  <option value="flat">Flat Amount ₹</option>
                  <option value="percent">Percentage %</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Value *</label>
                <input 
                  type="number" 
                  required min="1"
                  className="w-full p-2 border border-ink/20 bg-paper font-mono text-sm focus:outline-none focus:border-blue-600"
                  value={customForm.value}
                  onChange={(e) => setCustomForm({...customForm, value: e.target.value})}
                  placeholder={customForm.type === 'flat' ? "500" : "20"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/70 mb-1">Reason / Apology Message (Optional)</label>
              <textarea 
                className="w-full p-2 border border-ink/20 bg-paper text-sm focus:outline-none focus:border-blue-600 h-20"
                value={customForm.reason}
                onChange={(e) => setCustomForm({...customForm, reason: e.target.value})}
                placeholder="e.g. your recent order was delayed..."
              />
            </div>

            <button 
              type="submit" 
              disabled={sendingCustom}
              className="w-full bg-blue-600 text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-blue-700 mt-4 transition-colors disabled:opacity-50"
            >
              {sendingCustom ? 'Generating & Sending...' : 'Generate & Send Coupon'}
            </button>
          </form>
        </div>

        {/* Active Coupons List */}
        <div className="lg:col-span-3 bg-white p-6 border border-ink/10 shadow-sm">
          <h2 className="font-serif text-xl tracking-widest mb-6 flex items-center gap-2">
            <Percent size={20} className="text-brick" /> Active Campaigns
          </h2>
          
          <div className="space-y-4">
            {coupons.map(coupon => {
              const isExpired = new Date(coupon.validTo) < new Date();
              const isExhausted = coupon.usedCount >= coupon.usageLimit;
              const status = isExpired ? 'Expired' : isExhausted ? 'Exhausted' : 'Active';

              return (
                <div key={coupon._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-ink/10 bg-paper/30 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-xl font-bold bg-cream px-2 py-1 tracking-widest">{coupon.code}</h3>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                        status === 'Active' ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-ink/70 uppercase tracking-wider">
                      {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`} 
                    </p>
                    <p className="text-xs text-ink/50 mt-1 font-mono">
                      Used: {coupon.usedCount} / {coupon.usageLimit}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-none border-ink/10 pt-4 md:pt-0">
                    <div className="text-right text-xs text-ink/50 font-mono">
                      <p>Expires:</p>
                      <p>{new Date(coupon.validTo).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-500 hover:bg-red-50 p-2 border border-transparent hover:border-red-200 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {coupons.length === 0 && (
              <p className="text-center py-8 text-sm text-ink/50 uppercase tracking-widest italic">
                No active campaigns. Create a coupon to get started.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
