import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { _id, name, price, discountPrice, images, category, sold, stock } = product;
  const { addToCart } = useCart();
  const [toast, setToast] = useState({ show: false, success: true, message: '' });
  
  const hasDiscount = discountPrice && discountPrice < price;
  const imageUrl = images && images.length > 0 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
    : 'https://via.placeholder.com/300x300?text=No+Image';

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) {
      setToast({ show: true, success: false, message: 'Sản phẩm đã hết hàng' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
      return;
    }
    const res = await addToCart(product, 1);
    setToast({
      show: true,
      success: res.success,
      message: res.message
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2500);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`absolute top-2 right-2 z-30 px-3 py-1.5 rounded-xl shadow-lg border text-[10px] font-bold transition-all duration-300 ${
          toast.success 
            ? 'bg-black text-white border-black' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
            Giảm giá
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <Link to={`/products/${_id}`} className="p-2 bg-white rounded-full text-black hover:bg-red-500 hover:text-white transition-colors text-xl">
            👁️
          </Link>
          <button 
            onClick={handleQuickAdd}
            className="p-2 bg-white rounded-full text-black hover:bg-red-500 hover:text-white transition-colors text-xl"
          >
            🛒
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            {category?.name || 'Chưa phân loại'}
          </span>
          <span className="text-[10px] text-gray-400">Đã bán: {sold}</span>
        </div>
        
        <Link to={`/products/${_id}`} className="block">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-red-500 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center space-x-2">
          {hasDiscount ? (
            <>
              <span className="text-red-600 font-bold">
                {discountPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-gray-400 text-sm line-through">
                {price.toLocaleString('vi-VN')}₫
              </span>
            </>
          ) : (
            <span className="text-black font-bold">
              {price.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default ProductCard;
