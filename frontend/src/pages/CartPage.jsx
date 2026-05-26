import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const getImageUrl = (images) => {
    return images && images.length > 0 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const handleQtyChange = async (productId, currentQty, amount, stock) => {
    const newQty = currentQty + amount;
    if (newQty < 1 || newQty > stock) return;

    setUpdatingId(productId);
    setErrorMsg('');
    const result = await updateQuantity(productId, newQty);
    if (!result.success) {
      setErrorMsg(result.message);
    }
    setUpdatingId(null);
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    await removeFromCart(productId);
    setUpdatingId(null);
  };

  const shippingCost = cart.totalPrice > 1000000 ? 0 : 30000;
  const finalTotal = cart.totalPrice + shippingCost;

  if (loading && cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex space-x-6 p-6 border border-gray-100 rounded-3xl bg-gray-50 h-40"></div>
            ))}
          </div>
          <div className="border border-gray-100 rounded-3xl bg-gray-50 h-80"></div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 text-gray-400 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Hãy thêm các sản phẩm yêu thích của bạn vào giỏ hàng và trải nghiệm dịch vụ hoàn hảo của chúng tôi.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-8 py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={20} className="mr-2" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Giỏ hàng của bạn
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Có {cart.totalItems} sản phẩm trong giỏ hàng
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-red-600 font-medium transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Card list */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => {
            if (!item.productId) return null;
            const product = item.productId;
            const priceToUse = product.discountPrice > 0 ? product.discountPrice : product.price;
            const originalPrice = product.price;
            const isDiscounted = product.discountPrice > 0;

            return (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
              >
                {/* Info & Image */}
                <div className="flex items-center space-x-6 w-full sm:w-auto">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-bold text-gray-900 hover:text-red-500 transition-colors truncate block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                      Sneaker
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-bold text-gray-900">
                        {priceToUse.toLocaleString('vi-VN')}₫
                      </span>
                      {isDiscounted && (
                        <span className="text-xs text-gray-400 line-through">
                          {originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (Qty and Delete) */}
                <div className="flex items-center justify-between sm:justify-end space-x-8 w-full sm:w-auto mt-6 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-full border border-gray-100">
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                      disabled={item.quantity <= 1 || updatingId === product._id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-black hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                      disabled={item.quantity >= product.stock || updatingId === product._id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:text-black hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-black text-gray-950 text-base min-w-[90px] text-right">
                      {(priceToUse * item.quantity).toLocaleString('vi-VN')}₫
                    </span>
                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={updatingId === product._id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Tổng kết đơn hàng
          </h2>

          <div className="space-y-4 text-sm border-b border-gray-100 pb-6">
            <div className="flex justify-between text-gray-500">
              <span>Tổng tiền hàng</span>
              <span className="font-bold text-gray-900">
                {cart.totalPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Phí vận chuyển</span>
              <span className="font-bold text-gray-900">
                {shippingCost === 0 ? 'Miễn phí' : `${shippingCost.toLocaleString('vi-VN')}₫`}
              </span>
            </div>
            {shippingCost > 0 && (
              <p className="text-[11px] text-gray-400 leading-normal">
                Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-gray-900">
            <span className="font-bold">Tổng thanh toán</span>
            <span className="text-2xl font-black tracking-tight text-red-600">
              {finalTotal.toLocaleString('vi-VN')}₫
            </span>
          </div>

          <Link
            to="/checkout"
            className="w-full py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold text-center block transition-all duration-300 shadow-md hover:shadow-lg mt-2"
          >
            Tiến hành thanh toán
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center text-sm font-semibold text-gray-500 hover:text-black transition-colors py-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
