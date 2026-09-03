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
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2289821805188406');
fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2289821805188406&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
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
