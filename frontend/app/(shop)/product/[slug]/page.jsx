import api from '@/lib/api';
import { formatINR, hoursLeftToDelete } from '@/lib/utils';
import AddToCartBtn from './AddToCartBtn';
import ProductGallery from './ProductGallery';
import ProductPageClient from './ProductPageClient';

export async function generateMetadata({ params }) {
  try {
    const res = await api.get(`/products/${params.slug}`);
    const product = res.data;
    return {
      title: `${product.name} | Octune Vintage`,
      description: product.shortDescription || product.description,
    };
  } catch (error) {
    return { title: 'Product Not Found | Octune Vintage' };
  }
}

async function getProduct(slug) {
  try {
    const res = await api.get(`/products/${slug}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const product = await getProduct(params.slug);

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
