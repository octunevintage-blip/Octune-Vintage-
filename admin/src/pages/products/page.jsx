'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100&includeUpcoming=true');
      setProducts(res.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product and its images?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const toastId = toast.loading('Updating status...');
      await api.put(`/products/${id}`, { status: newStatus });
      toast.success('Status updated successfully', { id: toastId });
      
      // Update local state immediately for instant feedback
      setProducts(prevProducts => 
        prevProducts.map(p => p._id === id ? { ...p, status: newStatus } : p)
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-20 uppercase tracking-widest text-sm text-ink/50">Loading Inventory...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10 pb-4 border-b border-ink/10">
        <h1 className="font-serif text-3xl uppercase tracking-widest">Inventory</h1>
        <Link href="/products/new" className="btn btn-primary flex items-center shadow-md">
          <Plus size={16} className="mr-2" /> Add Piece
        </Link>
      </div>
      
      <div className="bg-white border border-ink/10 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-paper uppercase tracking-widest text-xs text-ink/60 border-b border-ink/10">
            <tr>
              <th className="p-4 font-medium">Piece</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-cream/50 transition-colors">
                <td className="p-4 flex items-center space-x-4">
                  <div className="relative w-12 h-16 bg-paper border border-ink/10">
                    <Image src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} fill className="object-cover" />
                  </div>
                  <span className="font-serif text-base">{product.name}</span>
                </td>
                <td className="p-4 uppercase tracking-widest text-xs">{product.category}</td>
                <td className="p-4">
                  <select
                    value={product.status}
                    onChange={(e) => handleStatusChange(product._id, e.target.value)}
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border font-bold font-mono focus:outline-none focus:border-brick bg-white cursor-pointer transition-colors ${
                      product.status === 'available' ? 'border-green-500/30 text-green-600 hover:bg-green-50/50' :
                      product.status === 'sold' ? 'border-brick/30 text-brick hover:bg-brick/5' :
                      product.status === 'out-of-stock' ? 'border-red-500/30 text-red-600 hover:bg-red-50/50' :
                      'border-ink/20 text-ink/60 hover:bg-paper'
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="p-4 font-medium">{formatINR(product.price)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-3">
                    <Link href={`/products/${product._id}/edit`} className="text-ink/50 hover:text-ink transition-colors">
                      <Edit size={18} strokeWidth={1.5} />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="text-ink/50 hover:text-brick transition-colors">
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-ink/50 uppercase tracking-widest text-xs">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
