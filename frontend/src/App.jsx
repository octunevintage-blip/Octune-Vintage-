import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import SignupPopupWrapper from '@/components/SignupPopupWrapper';
import MobileBottomNav from '@/components/MobileBottomNav';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppFloat from '@/components/WhatsAppFloat';

// Shop/Frontend Pages
import Home from '@/pages/(shop)/page';
import Shop from '@/pages/(shop)/shop/page';
import ProductDetail from '@/pages/(shop)/product/[slug]/page';
import Cart from '@/pages/(shop)/cart/page';
import Checkout from '@/pages/(shop)/checkout/page';
import Contact from '@/pages/(shop)/contact/page';
import OrderSuccess from '@/pages/(shop)/order-success/[id]/page';
import Account from '@/pages/(shop)/account/page';
import About from '@/pages/about/page';
import Privacy from '@/pages/privacy/page';
import Terms from '@/pages/terms/page';
import Shipping from '@/pages/shipping/page';
import CustomerInvoice from '@/pages/(shop)/account/invoice/[id]/page';
import ResetPassword from '@/pages/(shop)/reset-password/[token]/page';
import OurPeoples from '@/pages/our-people/page';

// Shop Layout Wrapper with global Navbar and Footer
function ShopLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-vnv-white text-vnv-black font-sans overflow-x-hidden">
      <Navbar />
      <main className="flex-grow min-h-[80vh]">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <AuthModal />
      <SignupPopupWrapper />
      <CookieConsent />
      <WhatsAppFloat />
      <Toaster position="top-center" />
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Printable standalone routes */}
        <Route path="/account/invoice/:id" element={<CustomerInvoice />} />
        
        {/* Main Customer facing Shop Routes */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/our-people" element={<OurPeoples />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping" element={<Shipping />} />
        </Route>
      </Routes>
    </Router>
  );
}
