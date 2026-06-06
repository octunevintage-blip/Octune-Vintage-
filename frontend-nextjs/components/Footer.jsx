import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-vnv-black text-vnv-white pt-20 pb-10 font-sans border-t-4 border-vnv-black">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        
        <div className="space-y-6">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Octune Vintage"
              width={140}
              height={56}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="text-vnv-gray text-sm leading-relaxed max-w-xs">
            Premium 1-of-1 curated streetwear. One piece. One owner. No restocks.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg uppercase tracking-widest mb-6">Support</h3>
          <ul className="space-y-3 text-sm text-vnv-gray uppercase tracking-widest">
            <li><Link href="/about" className="hover:text-vnv-white transition-colors">About Us</Link></li>
            <li><Link href="/shipping" className="hover:text-vnv-white transition-colors">Shipping Info</Link></li>
            <li><Link href="/terms" className="hover:text-vnv-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-vnv-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/admin/login" className="text-red-400 hover:text-red-300 font-bold transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg uppercase tracking-widest mb-6">Stay Updated</h3>
          <p className="text-vnv-gray text-xs mb-4 uppercase tracking-widest">Join the drop list. Get notified the second we archive new pieces.</p>
          <form className="flex">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="bg-vnv-white text-vnv-black px-4 py-3 text-xs w-full focus:outline-none placeholder:text-vnv-gray font-display tracking-widest"
              required
            />
            <button type="submit" className="bg-vnv-gray text-vnv-white px-6 font-display text-xs tracking-widest hover:bg-vnv-white hover:text-vnv-black transition-colors uppercase">
              Submit
            </button>
          </form>
        </div>

      </div>

      <div className="container mx-auto px-6 lg:px-12 mt-20 pt-8 border-t border-vnv-dark-gray flex flex-col md:flex-row justify-between items-center text-xs text-vnv-gray uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} OCTUNE VINTAGE. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="https://www.instagram.com/octune_vintage" target="_blank" rel="noopener noreferrer" className="hover:text-vnv-white transition-colors">INSTAGRAM</a>
          <a href="https://www.facebook.com/share/1BCjH1QZu7/" target="_blank" rel="noopener noreferrer" className="hover:text-vnv-white transition-colors">FACEBOOK</a>
        </div>
      </div>
    </footer>
  );
}
