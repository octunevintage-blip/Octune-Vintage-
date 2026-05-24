export const metadata = { title: 'Shipping & Returns | Octune Vintage' };

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-20 max-w-4xl">
      <h1 className="font-display text-4xl uppercase tracking-widest mb-12 border-b border-ink/10 pb-6">Shipping & Returns</h1>
      <div className="space-y-8 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl uppercase tracking-widest mb-4">Shipping Policy</h2>
          <p>We ship all orders within 2-3 business days. Free shipping is automatically applied to orders over ₹999 within India. For orders under ₹999, a flat rate of ₹99 applies.</p>
        </section>
        <section>
          <h2 className="font-display text-xl uppercase tracking-widest mb-4">All Sales Are Final</h2>
          <p>Due to the unique, 1-of-1 nature of our vintage items, we do not accept returns, exchanges, or refunds. Please carefully review the measurements and condition details provided on the product page before making a purchase.</p>
        </section>
      </div>
    </div>
  );
}
