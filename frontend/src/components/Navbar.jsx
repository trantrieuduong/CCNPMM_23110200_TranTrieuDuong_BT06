import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [dropdownOpen]);

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
            <Link to="/cart" className="flex items-center space-x-1.5 hover:text-red-500 transition-colors text-sm font-medium">
              <span>Giỏ hàng</span>
              {cart.totalItems > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center space-x-2 hover:text-red-500 transition-all focus:outline-none py-2"
                >
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold hidden sm:inline">{user.name}</span>
                  <span className="text-xs transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scaleIn">
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-bold hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        Trang quản trị
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      Tài khoản
                    </Link>
                    <Link 
                      to="/orders" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      Đơn hàng
                    </Link>
                    <hr className="border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-rose-50 transition-colors"
                    >
                      Thoát
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-red-500 transition-colors text-sm font-medium">
                Đăng nhập
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
