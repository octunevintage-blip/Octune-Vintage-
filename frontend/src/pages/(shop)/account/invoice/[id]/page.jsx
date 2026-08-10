import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { Printer } from 'lucide-react';

export default function CustomerInvoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Invoice | Octune Vintage';
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error('Failed to load order for invoice', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center p-10 font-mono text-sm uppercase">Loading Invoice...</div>;
  if (!order) return <div className="text-center p-10 font-mono text-sm uppercase text-red-500">Invoice not found or unauthorized</div>;

  return (
    <div className="bg-white min-h-screen text-black p-4 md:p-8 font-sans">
      {/* Non-printable action bar */}
      <div className="max-w-4xl mx-auto flex justify-end mb-8 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-6 py-2 uppercase tracking-widest text-xs font-bold hover:bg-gray-800"
        >
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 border border-gray-200 print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
          <div>
            <img src="/logo.png" alt="Octune Vintage" className="h-10 md:h-14 w-auto object-contain mb-2" />
            <p className="text-sm text-gray-500 uppercase tracking-widest">Premium 1-of-1 Archive</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-300">INVOICE</h2>
            <p className="font-mono text-sm mt-2"><strong>Order #:</strong> {order.orderNumber}</p>
            <p className="font-mono text-sm"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="uppercase tracking-widest text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-4">Billed To</h3>
            <p className="font-bold">{order.customer.name}</p>
            <p className="text-sm">{order.customer.email}</p>
            <p className="text-sm">{order.customer.phone}</p>
          </div>
          <div>
            <h3 className="uppercase tracking-widest text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-4">Shipped To</h3>
            <p className="font-bold">{order.customer.name}</p>
            <p className="text-sm">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-sm">{order.shippingAddress.line2}</p>}
            <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            <p className="text-sm uppercase">{order.shippingAddress.country || 'India'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left mb-12">
          <thead className="bg-black text-white uppercase tracking-widest text-xs">
            <tr>
              <th className="py-4 px-4 font-medium">Description</th>
              <th className="py-4 px-4 font-medium text-center">Qty</th>
              <th className="py-4 px-4 font-medium text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(order.products && order.products.length > 0 ? order.products : (order.product ? [order.product] : [])).map((item, index) => (
              <tr key={item.productId || index}>
                <td className="py-6 px-4">
                  <p className="font-bold uppercase tracking-wider">{item.name || 'Item'}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                    Size: {item.size || 'OS'} {item.color ? `| Color: ${item.color}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase">1-of-1 Archive Piece</p>
                </td>
                <td className="py-6 px-4 text-center font-mono">1</td>
                <td className="py-6 px-4 text-right font-mono">{formatINR(item.price || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-full md:w-1/2 max-w-sm space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="uppercase tracking-widest text-gray-500">Subtotal</span>
              <span>{formatINR(order.pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase tracking-widest text-gray-500">Shipping</span>
              <span>{formatINR(order.pricing.shipping)}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="uppercase tracking-widest">Discount</span>
                <span>-{formatINR(order.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-4 border-t-2 border-black font-bold text-lg">
              <span className="uppercase tracking-widest">Total</span>
              <span>{formatINR(order.pricing.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 uppercase tracking-widest">
          <p className="font-bold text-black mb-1">Thank you for shopping with Octune Vintage!</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
}
