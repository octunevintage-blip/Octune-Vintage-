'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CATEGORIES } from '@/lib/utils';
import toast from 'react-hot-toast';
import { X, Upload, ImagePlus } from 'lucide-react';
import Image from 'next/image';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { file, preview }[]
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: CATEGORIES[0],
    brand: '',
    era: '',
    size: '',
    colorName: '',
    colorHex: '#000000',
    price: '',
    mrp: '',
    material: '',
    condition: 'Used',
    chest: '',
    length: '',
    shoulder: '',
    sleeve: '',
    waist: '',
    inseam: '',
    dropAt: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const remaining = 4 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    const toAdd = newFiles.slice(0, remaining);
    if (newFiles.length > remaining) {
      toast.error(`Only ${remaining} slot(s) left. Added first ${remaining}.`);
    }
    const previews = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...previews]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      return toast.error('At least one image is required');
    }

    setLoading(true);
    const data = new FormData();

    const payload = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      category: formData.category,
      brand: formData.brand,
      era: formData.era,
      size: formData.size,
      color: { name: formData.colorName, hex: formData.colorHex },
      price: Number(formData.price),
      mrp: formData.mrp ? Number(formData.mrp) : undefined,
      material: formData.material,
      condition: formData.condition,
      measurements: {
        chest: formData.chest, length: formData.length, shoulder: formData.shoulder,
        sleeve: formData.sleeve, waist: formData.waist, inseam: formData.inseam
      },
      dropAt: formData.dropAt ? new Date(formData.dropAt).toISOString() : null
    };

    data.append('data', JSON.stringify(payload));
    images.forEach(({ file }) => data.append('images', file));

    try {
      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Piece archived successfully');
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl uppercase tracking-widest mb-10 pb-4 border-b border-ink/10">Archive New Piece</h1>

      <form onSubmit={handleSubmit} className="space-y-12 bg-white p-10 border border-ink/10 shadow-sm">

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Piece Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input bg-paper/50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Category *</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="input bg-paper/50">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Price Section - Strikethrough Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Selling Price (INR) *</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="input bg-paper/50" placeholder="e.g. 1499" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">MRP / Original Price</label>
                <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="input bg-paper/50" placeholder="e.g. 2999" />
              </div>
            </div>
            {/* Live preview of price display */}
            {(formData.price || formData.mrp) && (
              <div className="flex items-center gap-3 p-3 bg-paper border border-ink/10">
                <span className="font-black text-lg">
                  {formData.price ? `₹${Number(formData.price).toLocaleString('en-IN')}` : '—'}
                </span>
                {formData.mrp && Number(formData.mrp) > Number(formData.price) && (
                  <>
                    <span className="text-ink/40 line-through text-sm">₹{Number(formData.mrp).toLocaleString('en-IN')}</span>
                    <span className="text-xs font-bold bg-ink text-white px-2 py-0.5">
                      {Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={200} className="input bg-paper/50" />
            </div>
          </div>
        </section>

        {/* Image Upload Section - Up to 4 */}
        <section className="pt-8 border-t border-ink/10">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs uppercase tracking-widest text-ink/60">
              Product Images * <span className="text-ink/40">({images.length}/4)</span>
            </label>
            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs uppercase tracking-widest border border-ink/30 hover:border-ink px-3 py-2 transition-all"
              >
                <ImagePlus size={14} />
                Add Image
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-[3/4] bg-paper border border-ink/10 group overflow-hidden">
                <Image src={img.preview} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-ink text-white text-center text-[9px] uppercase tracking-widest py-1 font-bold">
                    Cover
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-white text-ink rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity border border-ink/10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] border-2 border-dashed border-ink/20 hover:border-ink/50 flex flex-col items-center justify-center gap-2 text-ink/30 hover:text-ink/60 transition-all"
              >
                <Upload size={20} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Upload</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-ink/40 mt-2 uppercase tracking-widest">First image is the cover. Max 4 images.</p>
        </section>

        {/* Size & Measurements */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-ink/10">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Size Label *</label>
              <input required type="text" name="size" value={formData.size} onChange={handleChange} className="input bg-paper/50" placeholder="e.g. L, XL, 32" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Color Name</label>
              <input type="text" name="colorName" value={formData.colorName} onChange={handleChange} className="input bg-paper/50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Color Hex</label>
              <div className="flex">
                <input type="color" name="colorHex" value={formData.colorHex} onChange={handleChange} className="h-12 w-12 border-none bg-transparent cursor-pointer" />
                <input type="text" value={formData.colorHex} readOnly className="input bg-paper/50 ml-2" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="input bg-paper/50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="input bg-paper/50">
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Used">Used</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Material</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} className="input bg-paper/50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Era (e.g. 90s, Y2K)</label>
              <input type="text" name="era" value={formData.era} onChange={handleChange} className="input bg-paper/50" />
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-widest text-ink/60">Measurements (in inches)</label>
            {[
              { name: 'chest', label: 'Bust / Chest' },
              { name: 'length', label: 'Length' },
              { name: 'shoulder', label: 'Shoulder' },
              { name: 'sleeve', label: 'Sleeve' },
              { name: 'waist', label: 'Waist' },
              { name: 'inseam', label: 'Inseam' },
            ].map(({ name, label }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-ink/50 w-20 flex-shrink-0">{label}</span>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="input bg-paper/50 text-sm py-1.5"
                  placeholder={`e.g. 20"`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-ink/10">
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink/60 mb-2">Schedule Drop (Leave empty for instant live)</label>
            <input type="datetime-local" name="dropAt" value={formData.dropAt} onChange={handleChange} className="input bg-paper/50 max-w-md" />
            <p className="text-xs text-ink/50 mt-2">If set in the future, product will be marked as "upcoming" and locked from purchase until this time.</p>
          </div>
        </section>

        <div className="pt-8 border-t border-ink/10 flex justify-end space-x-4">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary shadow-md">
            {loading ? 'Archiving...' : 'Save Piece'}
          </button>
        </div>

      </form>
    </div>
  );
}
