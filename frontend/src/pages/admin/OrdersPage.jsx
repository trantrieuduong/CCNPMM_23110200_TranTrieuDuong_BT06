import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Truck, 
  AlertTriangle,
  Info,
  Clock,
  Eye
} from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Phân trang & Bộ lọc
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal Xem chi tiết nhanh cho Admin
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/orders', {
        params: {
          page,
          limit: 10,
          status: statusFilter
        }
      });
      if (data.success) {
        setOrders(data.orders || []);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng cho admin:', err);
      setError('Không thể lấy danh sách đơn hàng từ hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  // Cập nhật trạng thái đơn hàng (Pending -> Confirmed -> Processing -> Shipping -> Delivered)
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setActionMessage(`Đã cập nhật trạng thái đơn hàng sang "${getStatusText(newStatus)}"`);
        // Update local state
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setActionLoading(false);
    }
  };

  // Phê duyệt hoặc Từ chối yêu cầu hủy đơn
  const handleCancellation = async (orderId, decision) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const { data } = await api.post(`/admin/orders/${orderId}/handle-cancellation`, { decision });
      if (data.success) {
        const finalStatus = decision === 'approve' ? 'Cancelled' : 'Processing';
        setActionMessage(decision === 'approve' 
          ? 'Đã đồng ý hủy đơn hàng. Tồn kho đã được tự động hoàn lại.' 
          : 'Đã từ chối hủy. Đơn hàng chuyển về trạng thái đang chuẩn bị.');
        
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: finalStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: finalStatus }));
        }
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error('Lỗi xử lý yêu cầu hủy:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu hủy đơn.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      Pending: 'Chờ xác nhận',
      Confirmed: 'Đã xác nhận',
      Processing: 'Chuẩn bị hàng',
      Shipping: 'Đang giao hàng',
      Delivered: 'Giao thành công',
      Cancelled: 'Đã hủy',
      CancellationRequested: 'Yêu cầu hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-100',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
      Processing: 'bg-purple-50 text-purple-700 border-purple-100',
      Shipping: 'bg-orange-50 text-orange-700 border-orange-100',
      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
      CancellationRequested: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 animate-pulse'
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusMap[status] || 'bg-gray-50 text-gray-700'}`}>
        {getStatusText(status)}
      </span>
    );
  };

  const getImageUrl = (images) => {
    return images && images.length > 0 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem lịch sử, theo dõi luồng giao dịch, cập nhật trạng thái đơn hàng và xử lý yêu cầu hủy từ khách hàng
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-semibold rounded-r-xl shadow-sm transition-all duration-300">
          {actionMessage}
        </div>
      )}

      {/* Bộ lọc & Điều khiển */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lọc trạng thái:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { value: '', text: 'Tất cả đơn hàng' },
            { value: 'Pending', text: 'Chờ xác nhận' },
            { value: 'Confirmed', text: 'Đã xác nhận' },
            { value: 'Processing', text: 'Đang chuẩn bị' },
            { value: 'Shipping', text: 'Đang giao' },
            { value: 'Delivered', text: 'Thành công' },
            { value: 'Cancelled', text: 'Đã hủy' },
            { value: 'CancellationRequested', text: 'Yêu cầu hủy' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                statusFilter === item.value 
                  ? 'bg-black text-white border-black' 
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-red-500 font-bold">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-400 space-y-3">
          <ShoppingBag size={48} className="mx-auto text-gray-300" />
          <p className="font-bold text-gray-700">Không tìm thấy đơn hàng nào</p>
          <p className="text-xs text-gray-400">Không có đơn hàng nào khớp với điều kiện lọc hiện tại của bạn.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Mã đơn</th>
                  <th className="py-4 px-6">Khách hàng</th>
                  <th className="py-4 px-6">Ngày đặt</th>
                  <th className="py-4 px-6">Tổng thanh toán</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                {orders.map((order) => {
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-mono font-black text-gray-900 text-xs uppercase tracking-wide">
                        #{order._id.substring(0, 8)}...
                      </td>
                      <td className="py-4.5 px-6">
                        <div>
                          <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.userId?.email || 'Khách vãng lai'}</p>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4.5 px-6 font-bold text-gray-900">
                        {order.totalPrice.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetails(order)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black rounded-full transition-all shadow-sm"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye size={15} />
                          </button>
                          
                          {/* Nút hành động nhanh dựa vào trạng thái */}
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                              Xác nhận
                            </button>
                          )}

                          {order.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Processing')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                              Chuẩn bị
                            </button>
                          )}

                          {order.status === 'Processing' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Shipping')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <Truck size={12} /> Giao hàng
                            </button>
                          )}

                          {order.status === 'Shipping' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                            >
                              Thành công
                            </button>
                          )}

                          {/* Đối với yêu cầu hủy đơn */}
                          {order.status === 'CancellationRequested' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleCancellation(order._id, 'approve')}
                                disabled={actionLoading}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full transition-all shadow-sm"
                                title="Chấp nhận hủy đơn & hoàn kho"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleCancellation(order._id, 'reject')}
                                disabled={actionLoading}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full transition-all shadow-sm"
                                title="Từ chối hủy & chuẩn bị tiếp"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pages > 1 && (
            <div className="py-4 px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Trang {page} / {pages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                  disabled={page === pages}
                  className="p-2 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal chi tiết đơn hàng dành cho Admin */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                  Chi tiết đơn hàng #{selectedOrder._id.substring(0, 10)}...
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Mã đầy đủ: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setShowDetailModal(false);
                }}
                className="p-2 text-gray-400 hover:text-black rounded-full bg-gray-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Trạng thái hiện tại trong Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              
              {/* Cập nhật nhanh từ Modal */}
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'Confirmed')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    Xác nhận đơn
                  </button>
                )}

                {selectedOrder.status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'Processing')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    Chuẩn bị soạn hàng
                  </button>
                )}

                {selectedOrder.status === 'Processing' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'Shipping')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  >
                    <Truck size={12} /> Bàn giao giao hàng
                  </button>
                )}

                {selectedOrder.status === 'Shipping' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'Delivered')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    Giao thành công
                  </button>
                )}

                {selectedOrder.status === 'CancellationRequested' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancellation(selectedOrder._id, 'approve')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <Check size={12} /> Đồng ý hủy & Hoàn kho
                    </button>
                    <button
                      onClick={() => handleCancellation(selectedOrder._id, 'reject')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <X size={12} /> Từ chối yêu cầu hủy
                    </button>
                  </div>
                )}

                {/* Hủy đơn cưỡng chế cho bất cứ trạng thái nào chưa hoàn thành/chưa hủy */}
                {!['Delivered', 'Cancelled', 'CancellationRequested'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => {
                      if(window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Sản phẩm sẽ được hoàn lại tồn kho.')){
                        handleUpdateStatus(selectedOrder._id, 'Cancelled');
                      }
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-bold transition-all"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>

            {/* Lý do hủy nếu có */}
            {selectedOrder.cancellationReason && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex gap-3 text-xs leading-relaxed">
                <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lý do hủy đơn hàng:</span>
                  <p className="italic mt-1">"{selectedOrder.cancellationReason}"</p>
                </div>
              </div>
            )}

            {/* Thông tin khách hàng & Giao nhận */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  Khách đặt hàng
                </h4>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Tên:</span> <span className="font-bold text-gray-800">{selectedOrder.userId?.fullName || 'Khách vãng lai'}</span></p>
                  <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-800">{selectedOrder.userId?.email || 'N/A'}</span></p>
                  <p><span className="text-gray-400">Số điện thoại:</span> <span className="font-bold text-gray-800">{selectedOrder.userId?.phoneNumber || 'N/A'}</span></p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  Thông tin giao nhận (Địa chỉ nhận)
                </h4>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Họ tên nhận:</span> <span className="font-bold text-gray-800">{selectedOrder.shippingAddress.fullName}</span></p>
                  <p><span className="text-gray-400">Số điện thoại nhận:</span> <span className="font-bold text-gray-800">{selectedOrder.shippingAddress.phoneNumber}</span></p>
                  <p className="leading-relaxed"><span className="text-gray-400">Địa chỉ chi tiết:</span> <span className="font-bold text-gray-800">{selectedOrder.shippingAddress.address}</span></p>
                </div>
              </div>
            </div>

            {/* Chi tiết sản phẩm mua */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                <ShoppingBag size={16} className="text-gray-400" />
                Danh sách sản phẩm đã đặt
              </h4>
              <div className="divide-y divide-gray-100 space-y-3">
                {selectedOrder.items.map((item) => {
                  const p = item.productId;
                  const name = p ? p.name : item.name;
                  const slug = p ? p.slug : item.slug;
                  return (
                    <div key={item._id} className="flex items-center justify-between pt-3 first:pt-0">
                      <div className="flex items-center space-x-3">
                        {p && p.images && p.images.length > 0 && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                            <img
                              src={getImageUrl(p.images)}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 text-xs sm:text-sm">
                            {name} {!p && <span className="text-[10px] font-normal text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full ml-1">Đã ngừng kinh doanh</span>}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Giá đặt: {item.price.toLocaleString('vi-VN')}₫ {p ? `| Trong kho còn: ${p.stock}` : `| Slug: ${slug}`}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        {item.price.toLocaleString('vi-VN')}₫ × {item.quantity} = {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tổng hợp hóa đơn */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 flex flex-col items-end text-sm space-y-1.5 font-medium">
              <div className="flex justify-between w-full max-w-xs text-gray-500">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold text-gray-800">
                  {(selectedOrder.totalPrice - selectedOrder.shippingCost).toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-gray-500">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-gray-800">
                  {selectedOrder.shippingCost === 0 ? 'Miễn phí' : `${selectedOrder.shippingCost.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-gray-900 pt-2 border-t border-gray-200">
                <span className="font-bold">Tổng thanh toán (COD):</span>
                <span className="text-lg font-black text-red-600">
                  {selectedOrder.totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setShowDetailModal(false);
                }}
                className="px-6 py-2.5 bg-black text-white hover:bg-red-600 rounded-full font-bold text-xs transition-all"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
