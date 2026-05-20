'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Upload, Plus, Trash2, Save } from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resContent, resProducts] = await Promise.all([
        api.get('/content'),
        api.get('/products?limit=100') // fetch available products
      ]);
      setContent(resContent.data);
      setProducts(resProducts.data.products);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    try {
      const toastId = toast.loading('Uploading image...');
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Uploaded successfully', { id: toastId });
      callback(data.url);
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        hero: content.hero,
        heroBanners: content.heroBanners || [],
        splitBanners: content.splitBanners,
        customBanners: content.customBanners || [],
        trendingProducts: (content.trendingProducts || []).map(p => p._id || p)
      };

      await api.put('/content', payload);
      toast.success('Homepage Content Saved!');
      fetchData(); // refresh to get populated data back
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) return <div>Loading...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center border-b border-paper-dark pb-4">
        <h1 className="font-serif text-3xl tracking-wider text-brick">Homepage Content Management</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-brick text-cream px-6 py-2 uppercase tracking-widest text-sm font-bold flex items-center gap-2 hover:bg-brick-dark"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white p-6 border border-paper-dark shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl tracking-widest">1. Hero Banners</h2>
          {(!content.heroBanners || content.heroBanners.length < 4) && (
            <button 
              onClick={() => {
                setContent({
                  ...content, 
                  heroBanners: [...(content.heroBanners || []), { title: '', subtitle: '', linkText: '', linkUrl: '', image: '' }]
                });
              }}
              className="text-brick border border-brick px-3 py-1 flex items-center gap-1 text-xs uppercase tracking-widest hover:bg-brick hover:text-cream"
            >
              <Plus size={14} /> Add Hero Banner
            </button>
          )}
        </div>

        <div className="space-y-8">
          {(content.heroBanners || []).length === 0 && (
            <p className="text-sm text-ink/50 uppercase tracking-widest">No hero banners added.</p>
          )}

          {(content.heroBanners || []).map((banner, bannerIndex) => (
            <div key={bannerIndex} className="border border-paper-dark bg-paper p-6 relative">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold uppercase tracking-widest text-lg">Hero Banner #{bannerIndex + 1}</h3>
                <button 
                  onClick={() => {
                    const newBanners = [...content.heroBanners];
                    newBanners.splice(bannerIndex, 1);
                    setContent({...content, heroBanners: newBanners});
                  }}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Banner Title</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                      value={banner.title || ''}
                      onChange={(e) => {
                        const newBanners = [...content.heroBanners];
                        newBanners[bannerIndex].title = e.target.value;
                        setContent({...content, heroBanners: newBanners});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Subtitle</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                      value={banner.subtitle || ''}
                      onChange={(e) => {
                        const newBanners = [...content.heroBanners];
                        newBanners[bannerIndex].subtitle = e.target.value;
                        setContent({...content, heroBanners: newBanners});
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Link Text</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                        value={banner.linkText || ''}
                        onChange={(e) => {
                          const newBanners = [...content.heroBanners];
                          newBanners[bannerIndex].linkText = e.target.value;
                          setContent({...content, heroBanners: newBanners});
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Link URL</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                        value={banner.linkUrl || ''}
                        onChange={(e) => {
                          const newBanners = [...content.heroBanners];
                          newBanners[bannerIndex].linkUrl = e.target.value;
                          setContent({...content, heroBanners: newBanners});
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Banner Image</label>
                  {banner.image && (
                    <div className="relative w-full aspect-[21/9] bg-white mb-2 border border-paper-dark">
                      <Image src={banner.image} fill className="object-cover" alt="Banner" />
                    </div>
                  )}
                  <label className="bg-white border border-paper-dark px-3 py-2 cursor-pointer hover:bg-paper-dark flex items-center justify-center gap-2 text-xs uppercase tracking-widest w-full">
                    <Upload size={14} /> {banner.image ? 'Replace Image' : 'Upload Image'}
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, url => {
                      const newBanners = [...content.heroBanners];
                      newBanners[bannerIndex].image = url;
                      setContent({...content, heroBanners: newBanners});
                    })} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS SECTION */}
      <section className="bg-white p-6 border border-paper-dark shadow-sm">
        <h2 className="font-serif text-2xl tracking-widest mb-6">2. "What's Trending" Carousel</h2>
        <p className="text-sm text-ink/70 mb-4">Select the exact products you want to feature in the trending section on the homepage. Drag and drop functionality is not supported yet, so add them in the order you want them to appear.</p>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Add Product to Trending</label>
              <select 
                className="w-full p-3 border border-paper-dark bg-paper focus:outline-none focus:border-brick font-mono text-sm"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selectedProduct = products.find(p => p._id === e.target.value);
                  if (selectedProduct && !(content.trendingProducts || []).some(p => (p._id || p) === selectedProduct._id)) {
                    setContent({
                      ...content,
                      trendingProducts: [...(content.trendingProducts || []), selectedProduct]
                    });
                  }
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>Select a product to feature...</option>
                {products.filter(p => !(content.trendingProducts || []).some(tp => (tp._id || tp) === p._id)).map(p => (
                  <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of currently trending products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {(content.trendingProducts || []).length === 0 && (
              <p className="text-sm text-ink/50 uppercase tracking-widest col-span-4 py-4">No products selected. The homepage will automatically show the latest arrivals instead.</p>
            )}
            {(content.trendingProducts || []).map((product, index) => {
              // Handle populated product object or just ID
              const prodData = product._id ? product : products.find(p => p._id === product);
              if (!prodData) return null;

              return (
                <div key={prodData._id} className="border border-paper-dark bg-paper p-3 flex flex-col gap-3 relative group">
                  <div className="relative w-full aspect-[4/5] bg-white">
                    {prodData.images && prodData.images[0] && (
                      <Image src={prodData.images[0].url} fill className="object-cover" alt={prodData.name} />
                    )}
                    <button 
                      onClick={() => {
                        const newTrending = [...(content.trendingProducts || [])];
                        newTrending.splice(index, 1);
                        setContent({...content, trendingProducts: newTrending});
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from Trending"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest truncate" title={prodData.name}>{prodData.name}</h4>
                    <p className="text-xs text-ink/60 font-mono mt-1">₹{prodData.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPLIT BANNERS SECTION */}
      <section className="bg-white p-6 border border-paper-dark shadow-sm">
        <h2 className="font-serif text-2xl tracking-widest mb-6">3. Split Banners</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {content.splitBanners.map((banner, index) => (
            <div key={index} className="border border-paper-dark p-4 bg-paper/50">
              <h3 className="font-bold uppercase tracking-widest mb-4">Banner {index + 1}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Title</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                    value={banner.title}
                    onChange={(e) => {
                      const newBanners = [...content.splitBanners];
                      newBanners[index].title = e.target.value;
                      setContent({...content, splitBanners: newBanners});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Link Category (e.g., Jackets)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                    value={banner.linkCategory}
                    onChange={(e) => {
                      const newBanners = [...content.splitBanners];
                      newBanners[index].linkCategory = e.target.value;
                      setContent({...content, splitBanners: newBanners});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Image</label>
                  <div className="flex gap-4 items-end">
                    {banner.image && (
                      <div className="relative w-20 h-20 bg-white">
                        <Image src={banner.image} fill className="object-cover" alt="Banner" />
                      </div>
                    )}
                    <label className="bg-white border border-paper-dark px-3 py-2 cursor-pointer hover:bg-paper-dark flex items-center gap-2 text-xs uppercase tracking-widest">
                      <Upload size={14} /> Upload
                      <input type="file" className="hidden" onChange={(e) => handleUpload(e, url => {
                        const newBanners = [...content.splitBanners];
                        newBanners[index].image = url;
                        setContent({...content, splitBanners: newBanners});
                      })} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOM BANNERS SECTION */}
      <section className="bg-white p-6 border border-paper-dark shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl tracking-widest">4. Custom Banners</h2>
          <button 
            onClick={() => {
              setContent({
                ...content, 
                customBanners: [...(content.customBanners || []), { title: '', subtitle: '', linkText: '', linkUrl: '', image: '' }]
              });
            }}
            className="text-brick border border-brick px-3 py-1 flex items-center gap-1 text-xs uppercase tracking-widest hover:bg-brick hover:text-cream"
          >
            <Plus size={14} /> Add Custom Banner
          </button>
        </div>

        <div className="space-y-8">
          {(content.customBanners || []).length === 0 && (
            <p className="text-sm text-ink/50 uppercase tracking-widest">No custom banners added.</p>
          )}
          
          {(content.customBanners || []).map((banner, bannerIndex) => (
            <div key={bannerIndex} className="border border-paper-dark bg-paper p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold uppercase tracking-widest text-lg">Custom Banner #{bannerIndex + 1}</h3>
                <button 
                  onClick={() => {
                    const newBanners = [...content.customBanners];
                    newBanners.splice(bannerIndex, 1);
                    setContent({...content, customBanners: newBanners});
                  }}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Banner Title (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                      value={banner.title}
                      onChange={(e) => {
                        const newBanners = [...content.customBanners];
                        newBanners[bannerIndex].title = e.target.value;
                        setContent({...content, customBanners: newBanners});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Subtitle / Description (Optional)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                      value={banner.subtitle}
                      onChange={(e) => {
                        const newBanners = [...content.customBanners];
                        newBanners[bannerIndex].subtitle = e.target.value;
                        setContent({...content, customBanners: newBanners});
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Link Text (e.g., SHOP NOW)</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                        value={banner.linkText}
                        onChange={(e) => {
                          const newBanners = [...content.customBanners];
                          newBanners[bannerIndex].linkText = e.target.value;
                          setContent({...content, customBanners: newBanners});
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Link URL (e.g., /shop)</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-paper-dark bg-white focus:outline-none focus:border-brick font-mono text-sm"
                        value={banner.linkUrl}
                        onChange={(e) => {
                          const newBanners = [...content.customBanners];
                          newBanners[bannerIndex].linkUrl = e.target.value;
                          setContent({...content, customBanners: newBanners});
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1 text-ink/70">Banner Image</label>
                  {banner.image && (
                    <div className="relative w-full aspect-[21/9] bg-white mb-2 border border-paper-dark">
                      <Image src={banner.image} fill className="object-cover" alt="Banner" />
                    </div>
                  )}
                  <label className="bg-white border border-paper-dark px-3 py-2 cursor-pointer hover:bg-paper-dark flex items-center justify-center gap-2 text-xs uppercase tracking-widest w-full">
                    <Upload size={14} /> {banner.image ? 'Replace Image' : 'Upload Image'}
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, url => {
                      const newBanners = [...content.customBanners];
                      newBanners[bannerIndex].image = url;
                      setContent({...content, customBanners: newBanners});
                    })} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
