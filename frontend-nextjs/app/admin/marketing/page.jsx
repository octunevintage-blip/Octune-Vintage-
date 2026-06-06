'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Percent } from 'lucide-react';

export default function MarketingDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDrop, setSavingDrop] = useState(false);
  
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsRes, contentRes] = await Promise.all([
        api.get('/coupons'),
        api.get('/content')
      ]);
      setCoupons(couponsRes.data);
      setContent(contentRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      toast.success('Coupon created successfully');
      fetchData();
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
      fetchData();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Marketing Data...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b border-ink/10 pb-4">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Marketing & Promos</h1>
      </div>

      {/* NEXT DROP TIMER SECTION */}
      <section className="bg-white p-6 border border-ink/10 shadow-sm relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-xl tracking-widest flex items-center gap-2">
              Next Drop Timer (Navbar)
            </h2>
            <p className="text-sm text-ink/70 mt-1">Display an animated countdown timer at the very top of the website. It automatically hides when it reaches 0.</p>
          </div>
          <button 
            onClick={async () => {
              try {
                setSavingDrop(true);
                await api.put('/content', { nextDrop: content.nextDrop });
                toast.success('Timer settings saved!');
              } catch (err) {
                toast.error('Failed to save timer settings');
              } finally {
                setSavingDrop(false);
              }
            }}
            disabled={savingDrop}
            className="bg-brick text-cream px-4 py-2 uppercase tracking-widest text-xs font-bold hover:bg-brick-dark disabled:opacity-50"
          >
            {savingDrop ? 'Saving...' : 'Save Timer'}
          </button>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox"
              checked={content?.nextDrop?.isActive || false}
              onChange={(e) => setContent({...content, nextDrop: {...(content.nextDrop || {}), isActive: e.target.checked}})}
              className="accent-brick w-4 h-4"
            />
            <span className="text-sm font-bold uppercase tracking-widest">Enable Countdown Timer</span>
          </label>
          
          {content?.nextDrop?.isActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Timer Title</label>
                <input 
                  type="text"
                  className="w-full p-2 border border-ink/20 bg-paper focus:outline-none focus:border-brick font-mono text-sm"
                  placeholder="E.g. NEXT DROP IN:"
                  value={content?.nextDrop?.title || 'NEXT DROP IN:'}
                  onChange={(e) => setContent({...content, nextDrop: {...(content.nextDrop || {}), title: e.target.value}})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Target Date & Time</label>
                <input 
                  type="datetime-local"
                  className="w-full p-2 border border-ink/20 bg-paper focus:outline-none focus:border-brick font-mono text-sm"
                  value={content?.nextDrop?.targetDate ? new Date(content.nextDrop.targetDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setContent({...content, nextDrop: {...(content.nextDrop || {}), targetDate: e.target.value}})}
                />
              </div>
            </div>
          )}
        </div>
      </section>

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

        {/* Active Coupons List */}
        <div className="lg:col-span-2 bg-white p-6 border border-ink/10 shadow-sm">
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
