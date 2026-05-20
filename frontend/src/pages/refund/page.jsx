export const metadata = { title: 'Refund Policy | Octune Vintage' };

export default function RefundPage() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-20 max-w-4xl">
      <h1 className="font-serif text-4xl uppercase tracking-widest mb-12 border-b border-ink/10 pb-6">Refund & Return Policy</h1>
      <div className="space-y-8 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">1. Return Window</h2>
          <p>We accept returns within 7 days of delivery. If 7 days have gone by since your delivery date, unfortunately, we cannot offer you a refund or exchange.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">2. Condition of Returns</h2>
          <p>To be eligible for a return, your item must be unworn, unwashed, and in the same condition that you received it. It must also have any original tags/packaging still attached.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">3. Vintage Condition & Flaws</h2>
          <p>Please note that vintage items are expected to have some level of wear and tear, slight fading, or minor flaws. Any major flaws will be clearly photographed and listed in the product description. Returns based on minor pre-disclosed flaws may not be accepted under free returns.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">4. Refunds Process</h2>
          <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment (processed via Razorpay) within 5-7 business days.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">5. Shipping Costs</h2>
          <p>You will be responsible for paying your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
        </section>
      </div>
    </div>
  );
}
