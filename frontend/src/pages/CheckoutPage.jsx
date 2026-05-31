import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

const CheckoutPage = () => {
  const { cart, loading, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // State cho Sổ địa chỉ
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Tải danh sách địa chỉ của người dùng
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/users/addresses');
        const list = data.data || [];
        setAddresses(list);

        // Tự động điền địa chỉ mặc định nếu có
        const defaultAddr = list.find(addr => addr.isDefault);
        if (defaultAddr) {
          setFormData(prev => ({
            ...prev,
            fullName: defaultAddr.fullName,
            phoneNumber: defaultAddr.phoneNumber,
            address: defaultAddr.address
          }));
          setSelectedAddressId(defaultAddr._id);
        } else if (list.length > 0) {
          // Hoặc điền địa chỉ đầu tiên nếu không có mặc định
          setFormData(prev => ({
            ...prev,
            fullName: list[0].fullName,
            phoneNumber: list[0].phoneNumber,
            address: list[0].address
          }));
          setSelectedAddressId(list[0]._id);
        }
      } catch (error) {
        console.error('Lỗi khi tải sổ địa chỉ tại checkout:', error);
      }
    };

    fetchAddresses();
  }, []);

  // Kiểm tra nếu giỏ hàng trống thì chuyển hướng về giỏ hàng (chỉ khi không ở màn hình success)
  useEffect(() => {
    if (!loading && cart.items.length === 0 && !createdOrder) {
      navigate('/cart');
    }
  }, [cart, loading, createdOrder, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Bỏ chọn địa chỉ đã lưu nếu người dùng gõ tay chỉnh sửa
    if (name !== 'note') {
      setSelectedAddressId('');
    }
  };

  const handleSelectAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      address: addr.address
    }));
    setSelectedAddressId(addr._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim()
      };

      const { data } = await api.post('/orders', { shippingAddress });
      if (data.success && data.data) {
        setCreatedOrder(data.data);
        await clearCart(); // Xóa sạch giỏ hàng sau khi đặt thành công
      }
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (images) => {
    return images && images.length > 0 
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/../${images[0]}`
      : 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const totalItemsPrice = cart.totalPrice;
  const shippingCost = totalItemsPrice >= 1000000 ? 0 : 30000;
  const finalTotal = totalItemsPrice + shippingCost;

  // Nếu đặt hàng thành công, hiển thị màn hình chúc mừng sang trọng
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-xl text-center space-y-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-2">
            <CheckCircle size={48} className="animate-scaleIn" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Đặt hàng thành công!</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Cảm ơn bạn đã lựa chọn sản phẩm của SNEAKERLAB. Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận.
            </p>
          </div>

          {/* Hóa đơn tóm tắt đơn hàng */}
          <div className="border border-dashed border-gray-200 rounded-3xl bg-gray-50 p-6 text-left space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-sm text-gray-400 font-medium">Mã đơn hàng:</span>
              <span className="font-mono font-black text-gray-900 tracking-wider uppercase text-sm sm:text-base">
                {createdOrder._id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-gray-200 pb-4">
              <div className="space-y-1">
                <p className="text-gray-400 flex items-center"><User size={14} className="mr-1.5" /> Người nhận:</p>
                <p className="font-bold text-gray-800">{createdOrder.shippingAddress.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 flex items-center"><Phone size={14} className="mr-1.5" /> Số điện thoại:</p>
                <p className="font-bold text-gray-800">{createdOrder.shippingAddress.phoneNumber}</p>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-gray-400 flex items-center"><MapPin size={14} className="mr-1.5" /> Địa chỉ giao hàng:</p>
                <p className="font-bold text-gray-800 leading-relaxed">{createdOrder.shippingAddress.address}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Hình thức thanh toán:</span>
                <span className="font-bold text-gray-900">COD (Thanh toán khi nhận hàng)</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-gray-900">
                  {createdOrder.shippingCost === 0 ? 'Miễn phí' : `${createdOrder.shippingCost.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-900 pt-2 border-t border-gray-200">
                <span className="font-bold text-base">Tổng thanh toán:</span>
                <span className="text-xl font-black text-red-600">
                  {createdOrder.totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/orders"
              className="px-8 py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center hover:scale-[1.03] active:scale-[0.97]"
            >
              <FileText size={18} className="mr-2" />
              Xem lịch sử đơn hàng
            </Link>
            <Link
              to="/"
              className="px-8 py-4 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full font-bold transition-all duration-300 flex items-center justify-center hover:scale-[1.03] active:scale-[0.97]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Link to="/cart" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-black transition-all duration-200 mb-4 hover:translate-x-[-4px]">
          <ArrowLeft size={16} className="mr-1.5" /> Quay lại giỏ hàng
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thanh toán đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">Vui lòng kiểm tra lại giỏ hàng và nhập thông tin giao nhận bên dưới</p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form nhập thông tin - 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center pb-4 border-b border-gray-100">
            <MapPin size={22} className="mr-2 text-red-500" />
            Thông tin nhận hàng
          </h2>

          {/* Chọn nhanh địa chỉ đã lưu */}
          {addresses.length > 0 && (
            <div className="pb-4 border-b border-gray-100">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-3">
                Chọn nhanh địa chỉ giao hàng đã lưu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    type="button"
                    onClick={() => handleSelectAddress(addr)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      selectedAddressId === addr._id
                        ? 'border-red-500 bg-red-50/10 ring-1 ring-red-500'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 text-sm truncate pr-2">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="bg-red-500/10 text-red-600 text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md flex-shrink-0">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mb-1">{addr.phoneNumber}</div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">{addr.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Họ và tên người nhận
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 focus:border-black rounded-2xl text-sm font-medium focus:ring-0 focus:outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  placeholder="09XXXXXXXX"
                  pattern="[0-9]{10,11}"
                  title="Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 focus:border-black rounded-2xl text-sm font-medium focus:ring-0 focus:outline-none transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Địa chỉ nhận hàng chi tiết
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 pt-3.5 flex items-start text-gray-400">
                  <MapPin size={18} />
                </span>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 focus:border-black rounded-2xl text-sm font-medium focus:ring-0 focus:outline-none transition-all placeholder:text-gray-300 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="note" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Ghi chú giao hàng (Tùy chọn)
              </label>
              <textarea
                id="note"
                name="note"
                rows="2"
                placeholder="Ghi chú thêm cho shipper (Ví dụ: giao giờ hành chính, gọi điện trước khi giao...)"
                value={formData.note}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-black rounded-2xl text-sm font-medium focus:ring-0 focus:outline-none transition-all placeholder:text-gray-300 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Phương thức thanh toán bắt buộc
            </h3>
            <div className="flex items-center justify-between p-5 border border-black rounded-2xl bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-black text-white rounded-xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">COD (Thanh toán khi nhận hàng)</p>
                  <p className="text-xs text-gray-400 mt-0.5">Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-black flex-shrink-0 bg-white"></div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.items.length === 0}
            className="w-full py-4 bg-black text-white hover:bg-red-600 rounded-full font-bold text-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? 'Đang tiến hành đặt hàng...' : `Xác nhận đặt hàng - ${finalTotal.toLocaleString('vi-VN')}₫`}
          </button>
        </form>

        {/* Tóm tắt giỏ hàng bên phải - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center pb-4 border-b border-gray-100">
            <ShoppingBag size={22} className="mr-2 text-gray-400" />
            Chi tiết đơn mua ({cart.totalItems} món)
          </h2>

          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2 space-y-4 pb-4">
            {cart.items.map((item) => {
              if (!item.productId) return null;
              const product = item.productId;
              const priceToUse = product.discountPrice > 0 ? product.discountPrice : product.price;

              return (
                <div key={product._id} className="flex items-center space-x-4 pt-4 first:pt-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-sm flex-shrink-0">
                    {(priceToUse * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 text-sm border-t border-gray-100 pt-6">
            <div className="flex justify-between text-gray-500">
              <span>Tổng tiền hàng</span>
              <span className="font-bold text-gray-900">
                {totalItemsPrice.toLocaleString('vi-VN')}₫
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

          <div className="flex justify-between items-center text-gray-900 pt-4 border-t border-gray-100">
            <span className="font-bold">Tổng thanh toán</span>
            <span className="text-2xl font-black tracking-tight text-red-600">
              {finalTotal.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
