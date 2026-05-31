import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  Truck,
  HelpCircle
} from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho Modal hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
      }
    } catch (err) {
      console.error('Lỗi lấy chi tiết đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    setCancelError('');
    setIsCancelling(true);

    try {
      const { data } = await api.post(`/orders/${id}/cancel`, { 
        reason: cancelReason.trim() 
      });

      if (data.success) {
        setShowCancelModal(false);
        setCancelReason('');
        await fetchOrderDetails(); // Cập nhật lại giao diện sau khi hủy thành công
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu hủy:', err);
      setCancelError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn. Vui lòng thử lại.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getImageUrl = (images) => {
    return images && images.length > 0 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const getStatusDetails = (status) => {
    const statusMap = {
      Pending: {
        text: 'Chờ xác nhận',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={20} className="text-amber-500" />,
        desc: 'Đơn hàng mới của bạn đã được lưu trữ trên hệ thống và đang chờ xác nhận từ shop.'
      },
      Confirmed: {
        text: 'Đã xác nhận',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <CheckCircle size={20} className="text-blue-500" />,
        desc: 'Đơn hàng đã được xác nhận. Chúng tôi sẽ tiến hành chuyển đơn cho bộ phận soạn hàng.'
      },
      Processing: {
        text: 'Đang chuẩn bị hàng',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <ShoppingBag size={20} className="text-purple-500" />,
        desc: 'Shop đang chuẩn bị đầy đủ sản phẩm, đóng gói cẩn thận để bàn giao cho đối tác giao nhận.'
      },
      Shipping: {
        text: 'Đang giao hàng',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: <Truck size={20} className="text-orange-500" />,
        desc: 'Đơn hàng đang trên đường vận chuyển tới địa chỉ nhận của bạn. Vui lòng để ý điện thoại.'
      },
      Delivered: {
        text: 'Đã giao thành công',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={20} className="text-emerald-500" />,
        desc: 'Đơn hàng đã được giao nhận thành công. Cảm ơn bạn rất nhiều vì đã tin tưởng SNEAKERLAB!'
      },
      Cancelled: {
        text: 'Đã hủy đơn hàng',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <XCircle size={20} className="text-rose-500" />,
        desc: 'Đơn hàng đã bị hủy. Mọi sản phẩm đã được tự động hoàn lại tồn kho cho hệ thống.'
      },
      CancellationRequested: {
        text: 'Đang yêu cầu hủy đơn',
        className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        icon: <HelpCircle size={20} className="text-fuchsia-500" />,
        desc: 'Yêu cầu hủy đơn hàng của bạn đã gửi thành công. Vui lòng chờ admin phê duyệt duyệt đồng ý hoặc từ chối.'
      },
    };

    return statusMap[status] || { 
      text: status, 
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: <Clock size={20} className="text-gray-500" />,
      desc: ''
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-gray-200 rounded w-1/6 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 bg-gray-50 border border-gray-100 rounded-3xl p-6"></div>
            <div className="h-80 bg-gray-50 border border-gray-100 rounded-3xl p-6"></div>
          </div>
          <div className="h-80 bg-gray-50 border border-gray-100 rounded-3xl p-6"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
          <XCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Lỗi truy cập</h2>
        <p className="text-gray-500 mb-8">{error || 'Không tìm thấy thông tin đơn hàng này'}</p>
        <Link
          to="/orders"
          className="px-8 py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold transition-all inline-flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" /> Quay lại lịch sử
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusDetails(order.status);
  const totalQty = order.items.reduce((total, item) => total + item.quantity, 0);
  const totalItemsPrice = order.totalPrice - order.shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Link to="/orders" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-colors mb-4">
          <ArrowLeft size={16} className="mr-1.5" /> Trở lại danh sách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center">
              Chi tiết đơn hàng
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wide">
              MÃ ĐƠN HÀNG: #{order._id}
            </p>
          </div>
          
          {/* Nút hủy đơn hàng dựa theo trạng thái */}
          {order.status === 'Pending' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center self-start sm:self-auto"
            >
              Hủy đơn hàng này
            </button>
          )}

          {(order.status === 'Confirmed' || order.status === 'Processing') && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 rounded-full font-bold text-sm transition-all shadow-sm flex items-center justify-center self-start sm:self-auto"
            >
              Gửi yêu cầu hủy đơn
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cột trái - 8 cols */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Hộp Trạng thái lớn */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${statusInfo.className} flex gap-5 items-start`}>
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black tracking-tight">Trạng thái: {statusInfo.text}</h2>
              <p className="text-sm leading-relaxed opacity-90">{statusInfo.desc}</p>
              
              <div className="flex items-center text-xs opacity-75 pt-1.5 gap-3">
                <span className="flex items-center"><Calendar size={12} className="mr-1" /> Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Lý do hủy nếu có */}
          {(order.status === 'Cancelled' || order.status === 'CancellationRequested') && order.cancellationReason && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-start text-rose-800">
              <AlertTriangle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">Lý do hủy đơn hàng:</h3>
                <p className="text-sm mt-1 leading-relaxed italic">"{order.cancellationReason}"</p>
              </div>
            </div>
          )}

          {/* Danh sách sản phẩm */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-4">
              Sản phẩm trong đơn hàng ({totalQty} sản phẩm)
            </h3>

            <div className="divide-y divide-gray-100 space-y-4">
              {order.items.map((item) => {
                const product = item.productId;
                const name = product ? product.name : item.name;
                const slug = product ? product.slug : item.slug;
                return (
                  <div key={item._id} className="flex items-center space-x-6 pt-4 first:pt-0">
                    {product && product.images && product.images.length > 0 && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                        <img
                          src={getImageUrl(product.images)}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      {product ? (
                        <Link 
                          to={`/products/${product._id}`} 
                          className="font-bold text-gray-900 text-base hover:text-red-500 transition-colors truncate block"
                        >
                          {name}
                        </Link>
                      ) : (
                        <div className="font-bold text-gray-900 text-base truncate">
                          {name} <span className="text-xs font-normal text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full ml-2">Đã ngừng kinh doanh</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1 font-mono">Slug: {slug}</p>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-sm font-medium text-gray-500">
                          {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải - 4 cols */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Thông tin nhận hàng & Thanh toán */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-100 pb-4">
              Thông tin giao nhận
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Người nhận</p>
                  <p className="font-bold text-gray-800 mt-0.5">{order.shippingAddress.fullName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Điện thoại</p>
                  <p className="font-bold text-gray-800 mt-0.5">{order.shippingAddress.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Địa chỉ giao hàng</p>
                  <p className="font-bold text-gray-800 mt-0.5 leading-relaxed">{order.shippingAddress.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-4 border-t border-gray-100">
                <CreditCard size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Thanh toán</p>
                  <p className="font-bold text-gray-900 mt-0.5">COD</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Thanh toán tiền mặt khi nhận hàng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tóm tắt chi phí */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold text-gray-900">
                {totalItemsPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-gray-900">
                {order.shippingCost === 0 ? 'Miễn phí' : `${order.shippingCost.toLocaleString('vi-VN')}₫`}
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-900 pt-4 border-t border-gray-100">
              <span className="font-bold text-base">Tổng thanh toán:</span>
              <span className="text-xl font-black text-red-600">
                {order.totalPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy đơn / gửi yêu cầu hủy */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle size={24} className="flex-shrink-0" />
              <h3 className="text-xl font-black tracking-tight text-gray-900">
                {order.status === 'Pending' ? 'Xác nhận hủy đơn hàng' : 'Gửi yêu cầu hủy đơn hàng'}
              </h3>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              {order.status === 'Pending' 
                ? 'Đơn hàng ở trạng thái mới sẽ được hủy trực tiếp. Vui lòng cho biết lý do bạn muốn hủy đơn hàng này:' 
                : 'Đơn hàng đang ở trạng thái chuẩn bị. Yêu cầu hủy đơn của bạn sẽ được gửi tới Admin để duyệt. Vui lòng nhập lý do:'}
            </p>

            {cancelError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-semibold border-l-2 border-red-500">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <textarea
                required
                rows="4"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do chi tiết để hủy đơn hàng (Bắt buộc)..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-black rounded-2xl text-sm font-medium focus:ring-0 focus:outline-none transition-all placeholder:text-gray-300 resize-none"
              ></textarea>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setCancelError('');
                  }}
                  disabled={isCancelling}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-all"
                >
                  Đóng lại
                </button>
                <button
                  type="submit"
                  disabled={isCancelling || !cancelReason.trim()}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isCancelling ? 'Đang gửi...' : 'Xác nhận gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
