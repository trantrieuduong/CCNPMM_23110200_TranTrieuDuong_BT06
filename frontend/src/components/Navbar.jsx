import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              SNEAKER<span className="text-red-500">LAB</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/products" className="hover:text-red-500 transition-colors">Sản phẩm</Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative hover:text-red-500 transition-colors mr-2">
              <span className="text-xl">🛒</span>
              <span className="hidden sm:inline group-hover:text-red-500 transition-colors">Giỏ hàng</span>
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="hover:text-red-500 transition-colors flex items-center space-x-1 text-sm group">
                  <span className="text-lg">📦</span>
                  <span className="hidden sm:inline group-hover:text-red-500 transition-colors">Đơn hàng</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold group-hover:bg-red-600 transition-colors">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline group-hover:text-red-500 transition-colors">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-red-500 transition-colors flex items-center space-x-1"
                >
                  <span className="text-sm">Thoát</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="hover:text-red-500 transition-colors flex items-center space-x-1">
                <span className="text-xl">👤</span>
                <span className="hidden sm:inline text-sm">Đăng nhập</span>
              </Link>
            )}

            <div className="md:hidden">
              <span className="text-2xl cursor-pointer">☰</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
