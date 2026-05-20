import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import SignupPopupWrapper from '@/components/SignupPopupWrapper';

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
import Refund from '@/pages/refund/page';

// Admin Portal Pages
import AdminLayout from '@/pages/admin/layout';
import AdminLogin from '@/pages/admin/login/page';
import AdminDashboard from '@/pages/admin/dashboard/page';
import AdminProducts from '@/pages/admin/products/page';
import AdminProductsNew from '@/pages/admin/products/new/page';
import AdminProductsEdit from '@/pages/admin/products/[id]/edit/page';
import AdminOrders from '@/pages/admin/orders/page';
import AdminInvoice from '@/pages/admin/orders/invoice/[id]/page';
import AdminContent from '@/pages/admin/content/page';
import AdminMarketing from '@/pages/admin/marketing/page';

// Shop Layout Wrapper with global Navbar and Footer
function ShopLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-vnv-white text-vnv-black font-sans">
      <Navbar />
      <main className="pt-28 flex-grow min-h-[80vh]">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <SignupPopupWrapper />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
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
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/refund" element={<Refund />} />
        </Route>

        {/* Admin Login Portal */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard Protected Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductsNew />} />
          <Route path="products/:id/edit" element={<AdminProductsEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/invoice/:id" element={<AdminInvoice />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="marketing" element={<AdminMarketing />} />
        </Route>
      </Routes>
    </Router>
  );
}
