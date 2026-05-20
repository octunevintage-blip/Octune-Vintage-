import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Pages
import AdminLayout from '@/pages/layout';
import AdminLogin from '@/pages/login/page';
import AdminDashboard from '@/pages/dashboard/page';
import AdminProducts from '@/pages/products/page';
import AdminProductsNew from '@/pages/products/new/page';
import AdminProductsEdit from '@/pages/products/[id]/edit/page';
import AdminOrders from '@/pages/orders/page';
import AdminInvoice from '@/pages/orders/invoice/[id]/page';
import AdminContent from '@/pages/content/page';
import AdminMarketing from '@/pages/marketing/page';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect Root path to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Login Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Dashboard/Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/products/new" element={<AdminProductsNew />} />
          <Route path="/products/:id/edit" element={<AdminProductsEdit />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/orders/invoice/:id" element={<AdminInvoice />} />
          <Route path="/content" element={<AdminContent />} />
          <Route path="/marketing" element={<AdminMarketing />} />
        </Route>

        {/* Catch-all route redirecting back to root */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}
