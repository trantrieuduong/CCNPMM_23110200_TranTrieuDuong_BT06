import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ShoppingBag, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders');
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        setError('Không thể tải lịch sử mua hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: {
        text: 'Chờ xác nhận',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
      },
      Confirmed: {
        text: 'Đã xác nhận',
        className: 'bg-blue-50 text-blue-700 border-blue-100',
      },
      Processing: {
        text: 'Đang chuẩn bị hàng',
        className: 'bg-purple-50 text-purple-700 border-purple-100',
      },
      Shipping: {
        text: 'Đang giao hàng',
        className: 'bg-orange-50 text-orange-700 border-orange-100',
      },
      Delivered: {
        text: 'Đã giao thành công',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      Cancelled: {
        text: 'Đã hủy',
        className: 'bg-rose-50 text-rose-700 border-rose-100',
      },
      CancellationRequested: {
        text: 'Yêu cầu hủy',
        className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
      },
    };

    const currentStatus = statusMap[status] || { text: status, className: 'bg-gray-50 text-gray-700 border-gray-100' };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${currentStatus.className}`}>
        {currentStatus.text}
      </span>
    );
  };

  const getImageUrl = (images) => {
    return images && images.length > 0 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-10"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-gray-50 border border-gray-100 rounded-3xl p-6"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Đã xảy ra lỗi</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold transition-all"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 text-gray-400 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
          Bạn chưa có đơn hàng nào
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Chào mừng bạn đến với SNEAKERLAB. Hãy chọn cho mình đôi giày ưng ý nhất và đặt đơn hàng đầu tiên ngay nhé!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-8 py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Xem các sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          Lịch sử đơn hàng
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem thông tin, trạng thái giao nhận và quản lý các đơn hàng đã đặt của bạn
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const totalQty = order.items.reduce((total, item) => total + item.quantity, 0);
          const firstItem = order.items[0];

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-300 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Bên trái: Thông tin chính của đơn hàng */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
                {/* Ảnh của sản phẩm đầu tiên */}
                {firstItem && firstItem.productId ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img
                      src={getImageUrl(firstItem.productId.images)}
                      alt={firstItem.productId.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-black text-gray-900 text-sm tracking-wide uppercase">
                      #{order._id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center text-xs text-gray-400 gap-x-4 gap-y-1">
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span>•</span>
                    <span>Phương thức: {order.paymentMethod}</span>
                    <span>•</span>
                    <span className="font-bold text-gray-600">Mua {totalQty} sản phẩm</span>
                  </div>

                  {order.items.length > 1 && (
                    <p className="text-xs text-gray-500">
                      và {order.items.length - 1} sản phẩm khác...
                    </p>
                  )}
                </div>
              </div>

              {/* Bên phải: Tổng thanh toán và hành động */}
              <div className="flex flex-row md:flex-col sm:items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-400">Tổng thanh toán</p>
                  <p className="text-xl font-black text-red-600 mt-0.5">
                    {order.totalPrice.toLocaleString('vi-VN')}₫
                  </p>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="inline-flex items-center px-5 py-2.5 bg-gray-50 text-gray-800 hover:bg-black hover:text-white rounded-full text-xs font-bold transition-all duration-300 md:mt-4 shadow-sm"
                >
                  <FileText size={14} className="mr-1.5" />
                  Chi tiết đơn
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
