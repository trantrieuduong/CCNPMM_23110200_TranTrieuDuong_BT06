import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './pages/admin/AdminLayout';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import UsersPage from './pages/admin/UsersPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/admin/OrdersPage';

const AdminDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Doanh thu tháng</h3>
      <p className="text-4xl font-black tracking-tighter">128.5M₫</p>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Đơn hàng mới</h3>
      <p className="text-4xl font-black tracking-tighter">42</p>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Khách hàng mới</h3>
      <p className="text-4xl font-black tracking-tighter">+12</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <HomePage />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/products" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <SearchPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/products/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <ProductDetailPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/cart" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <CartPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/checkout" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <CheckoutPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/orders" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <OrderHistoryPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/orders/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <OrderDetailPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/login" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <LoginPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/register" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <RegisterPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/profile" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <ProfilePage />
                </main>
                <Footer />
              </div>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
