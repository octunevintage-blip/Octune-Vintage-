import { Open_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import SignupPopupWrapper from '@/components/SignupPopupWrapper';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });

export const metadata = {
  title: 'Octune Vintage | Premium 1-of-1',
  description: 'One Piece. One Owner. No Restocks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans bg-vnv-white text-vnv-black flex flex-col min-h-screen`}>
        <Navbar />
        <main className="min-h-[80vh]">
          {children}
        </main>
        <Footer />
        <AuthModal />
        <SignupPopupWrapper />
        <CookieConsent />
        <WhatsAppFloat />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
