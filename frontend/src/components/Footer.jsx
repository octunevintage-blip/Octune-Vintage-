import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-vnv-black text-vnv-white pt-16 md:pt-24 pb-8 md:pb-12 font-sans border-t border-vnv-dark-gray/30">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        
        {/* Brand & Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <Link href="/" className="block">
            <Image
              src="/logo_white.png"
              alt="Octune Vintage"
              width={4376}
              height={1466}
              className="w-auto object-contain h-[60px] md:h-[75px]"
              priority
            />
          </Link>
          <p className="text-vnv-gray text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            Premium 1-of-1 curated streetwear. One piece. One owner. No restocks.
          </p>
        </div>

        {/* Support Links */}
        <div className="text-center md:text-left">
          <h3 className="font-display text-base md:text-lg uppercase tracking-widest mb-6">Support</h3>
          <ul className="space-y-3.5 text-sm text-vnv-gray uppercase tracking-widest">
            <li><Link href="/about" className="hover:text-vnv-white transition-colors">About Us</Link></li>
            <li><Link href="/shipping" className="hover:text-vnv-white transition-colors">Shipping Info</Link></li>
            <li><Link href="/terms" className="hover:text-vnv-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-vnv-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund" className="hover:text-vnv-white transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Stay Updated / Newsletter */}
        <div className="text-center md:text-left">
          <h3 className="font-display text-base md:text-lg uppercase tracking-widest mb-6">Stay Updated</h3>
          <p className="text-vnv-gray text-xs md:text-sm mb-6 uppercase tracking-widest max-w-sm mx-auto md:mx-0 leading-relaxed">
            Join the drop list. Get notified the second we archive new pieces.
          </p>
          <form className="flex max-w-md mx-auto md:mx-0">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              className="bg-transparent text-vnv-white px-4 py-3 text-xs w-full focus:outline-none placeholder:text-vnv-gray font-display tracking-widest border border-r-0 border-vnv-dark-gray/40 focus:border-vnv-white transition-all"
              required
            />
            <button type="submit" className="bg-vnv-white text-vnv-black px-6 font-display text-xs tracking-widest hover:bg-transparent hover:text-vnv-white transition-all uppercase border border-vnv-white">
              Submit
            </button>
          </form>
        </div>

      </div>

      {/* Copyrights and Socials Row */}
      <div className="container mx-auto px-6 lg:px-12 mt-12 md:mt-20 pt-6 md:pt-8 border-t border-vnv-dark-gray/20 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-vnv-gray uppercase tracking-widest text-center md:text-left gap-4">
        <p>&copy; {new Date().getFullYear()} OCTUNE VINTAGE. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-6">
          <a href="https://www.instagram.com/octune_vintage2.0?igsh=MW4wamRmc283M211Ng%3D%3D&utm_source=qr" className="hover:text-vnv-white transition-colors">INSTAGRAM</a>
          
        </div>
      </div>
    </footer>
  );
}
