export const metadata = { title: 'Privacy Policy | Octune Vintage' };

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 lg:px-12 py-20 max-w-4xl">
      <h1 className="font-serif text-4xl uppercase tracking-widest mb-12 border-b border-ink/10 pb-6">Privacy Policy</h1>
      <div className="space-y-8 text-sm text-ink/80 leading-relaxed">
        <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">Information We Collect</h2>
          <p>We collect information you provide directly to us when you make a purchase or sign up for our newsletter. This includes your name, email address, shipping address, and phone number.</p>
        </section>
        <section>
          <h2 className="font-serif text-xl uppercase tracking-widest mb-4">Payment Processing</h2>
          <p>All payments are securely processed through Razorpay. We do not store your credit card details on our servers.</p>
        </section>
      </div>
    </div>
  );
}
