import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { hoursLeftToDelete } from '@/lib/utils';
import ProductPageClient from './ProductPageClient';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Failed to get product details:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vnv-white text-vnv-black flex flex-col items-center justify-center pt-20">
        <div className="font-display text-2xl uppercase tracking-widest animate-pulse">LOADING PRODUCT DETAILS...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-40 text-center bg-[#fafaf9] border border-black/5 my-12">
        <h1 className="font-display text-5xl uppercase font-bold tracking-tight mb-4">ITEM ARCHIVED</h1>
        <p className="text-[#999] uppercase tracking-widest text-xs font-bold">This piece is no longer available.</p>
      </div>
    );
  }

  const isSold = product.status === 'sold';
  const isLocked = product.isLocked;
  const hoursLeft = isSold ? hoursLeftToDelete(product.deleteAt) : 0;

  // Compute discount
  const hasDiscount = product.mrp && product.mrp > product.price && !isSold;
  const discountPct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  // Measurements rows
  const measurementLabels = {
    chest: 'Bust / Chest',
    length: 'Length',
    shoulder: 'Shoulder',
    sleeve: 'Sleeve',
    waist: 'Waist',
    inseam: 'Inseam',
  };
  const hasMeasurements = product.measurements && Object.values(product.measurements).some(Boolean);

  return (
    <ProductPageClient
      product={product}
      isSold={isSold}
      isLocked={isLocked}
      hoursLeft={hoursLeft}
      hasDiscount={hasDiscount}
      discountPct={discountPct}
      measurementLabels={measurementLabels}
      hasMeasurements={hasMeasurements}
    />
  );
}
