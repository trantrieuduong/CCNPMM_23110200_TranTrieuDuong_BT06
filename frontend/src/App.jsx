import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
import api from './services/api';
import { Users, FolderClosed, Package, DollarSign, ClipboardList, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Lỗi tải thống kê:', err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-3xl font-semibold text-center">
        {error || 'Có lỗi xảy ra khi lấy số liệu thống kê.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Tổng quan</h1>
        <p className="text-gray-500 text-sm font-medium">Số liệu hoạt động thực tế trên toàn hệ thống</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider">Người dùng</h3>
            <p className="text-2xl font-black tracking-tight mt-0.5">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FolderClosed size={24} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider">Danh mục</h3>
            <p className="text-2xl font-black tracking-tight mt-0.5">{stats.totalCategories}</p>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider">Sản phẩm</h3>
            <p className="text-2xl font-black tracking-tight mt-0.5">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider truncate">Doanh thu tháng</h3>
            <p className="text-xl font-black tracking-tight mt-0.5 text-red-600 truncate">
              {stats.monthlyRevenue.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>

        {/* Monthly Orders Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-wider">Đơn hàng tháng</h3>
            <p className="text-2xl font-black tracking-tight mt-0.5">{stats.monthlyOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

            <Route path="/verify-email" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <VerifyEmailPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/forgot-password" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <ForgotPasswordPage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/reset-password" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white">
                  <ResetPasswordPage />
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
