import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho Sổ địa chỉ
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    isDefault: false
  });
  const [addressMessage, setAddressMessage] = useState({ type: '', text: '' });
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);

  // State cho Xác thực đổi Email qua OTP
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpSubmitting, setEmailOtpSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const { data } = await api.get('/users/addresses');
      setAddresses(data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách địa chỉ:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Kiểm tra xem có thay đổi email không
    if (formData.email !== user.email) {
      setIsSubmitting(true);
      try {
        // Gửi OTP tới email mới trước
        const { data } = await api.post('/users/change-email-otp', { newEmail: formData.email });
        if (data.success) {
          setEmailOtp('');
          setEmailOtpError('');
          setShowEmailOtpModal(true); // Mở Modal nhập OTP
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Không thể gửi mã OTP xác thực email mới' 
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Nếu không đổi email, cập nhật trực tiếp tên bình thường
      setIsSubmitting(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
      setIsSubmitting(false);
    }
  };

  const handleEmailOtpSubmit = async (e) => {
    e.preventDefault();
    setEmailOtpError('');
    
    if (emailOtp.length !== 6 || isNaN(emailOtp)) {
      return setEmailOtpError('Mã OTP phải gồm 6 chữ số');
    }

    setEmailOtpSubmitting(true);

    // Gọi updateProfile qua authContext kèm OTP
    const result = await updateProfile({
      name: formData.name,
      email: formData.email,
      otp: emailOtp
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân và Email mới thành công!' });
      setShowEmailOtpModal(false);
      setIsEditing(false);
    } else {
      setEmailOtpError(result.message || 'Xác thực OTP thất bại');
    }
    setEmailOtpSubmitting(false);
  };

  // Các hàm xử lý địa chỉ
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setAddressFormData({
      fullName: '',
      phoneNumber: '',
      address: '',
      isDefault: addresses.length === 0
    });
    setAddressMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setAddressFormData({
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      address: addr.address,
      isDefault: addr.isDefault
    });
    setAddressMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsAddressSubmitting(true);
    setAddressMessage({ type: '', text: '' });

    try {
      if (editingAddress) {
        const { data } = await api.put(`/users/addresses/${editingAddress._id}`, addressFormData);
        setAddresses(data.data || []);
      } else {
        const { data } = await api.post('/users/addresses', addressFormData);
        setAddresses(data.data || []);
      }
      setShowModal(false);
    } catch (error) {
      setAddressMessage({
        type: 'error',
        text: error.response?.data?.message || 'Không thể lưu địa chỉ'
      });
    } finally {
      setIsAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        const { data } = await api.delete(`/users/addresses/${addressId}`);
        setAddresses(data.data || []);
      } catch (error) {
        alert(error.response?.data?.message || 'Không thể xóa địa chỉ');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const { data } = await api.patch(`/users/addresses/${addressId}/default`);
      setAddresses(data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể thiết lập địa chỉ mặc định');
    }
  };

  if (!user) return <div className="p-8 text-center text-sm font-medium">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 my-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Thông tin cá nhân */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
            <div className="bg-zinc-950 p-8 text-white text-center border-b border-zinc-800">
              <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center text-4xl font-bold mb-4 shadow-md text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
              <p className="opacity-70 text-xs font-semibold uppercase tracking-wider mt-1">
                {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
              </p>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Thông tin cá nhân</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-red-500 hover:text-red-600 font-bold transition-all duration-200 text-sm hover:scale-105 active:scale-95"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all ${!isEditing ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all ${!isEditing ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                      required
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50 text-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ name: user.name, email: user.email });
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Cột phải: Sổ địa chỉ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Sổ địa chỉ</h2>
                <p className="text-xs text-gray-500 mt-1">Quản lý các địa chỉ nhận hàng của bạn</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="bg-zinc-950 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:scale-[1.03] active:scale-[0.97]"
              >
                Thêm địa chỉ mới
              </button>
            </div>

            {addressLoading ? (
              <div className="py-12 text-center text-sm text-gray-500 font-medium">Đang tải sổ địa chỉ...</div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-sm text-gray-400 font-medium">Bạn chưa lưu địa chỉ giao hàng nào.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-3 text-red-500 hover:text-red-600 text-xs font-bold"
                >
                  Thêm địa chỉ đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-6 rounded-2xl border transition-all ${addr.isDefault ? 'border-red-500 bg-red-50/10' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-base">{addr.fullName}</span>
                          <span className="text-xs font-semibold text-gray-400">|</span>
                          <span className="text-sm font-semibold text-gray-600">{addr.phoneNumber}</span>
                          {addr.isDefault && (
                            <span className="bg-red-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{addr.address}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            className="text-xs font-bold text-zinc-500 hover:text-red-500 transition-all duration-200 px-2 py-1 hover:scale-105 active:scale-95"
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(addr)}
                          className="text-xs font-bold text-zinc-800 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Thêm / Sửa địa chỉ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>

            {addressMessage.text && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl mb-4">
                {addressMessage.text}
              </div>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1">Họ và tên người nhận</label>
                <input
                  type="text"
                  name="fullName"
                  value={addressFormData.fullName}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={addressFormData.phoneNumber}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-1">Địa chỉ chi tiết</label>
                <textarea
                  name="address"
                  value={addressFormData.address}
                  onChange={handleAddressChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Chỉ cho phép tích đặt mặc định nếu hiện tại nó chưa là mặc định */}
              {(!editingAddress || !editingAddress.isDefault) && (
                <div className="flex items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressChange}
                    className="w-4 h-4 rounded text-red-500 border-gray-300 focus:ring-red-500 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                    Đặt làm địa chỉ giao hàng mặc định
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isAddressSubmitting}
                  className="flex-1 bg-zinc-950 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all duration-200 text-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isAddressSubmitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nhập OTP thay đổi email */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-black">
                @
              </div>
            </div>
            
            <h3 className="text-lg font-black text-gray-900 text-center mb-2 tracking-tight">
              Xác thực Email mới
            </h3>
            
            <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed font-medium">
              Vui lòng nhập mã OTP 6 chữ số đã được gửi tới địa chỉ email mới của bạn: <span className="font-bold text-gray-800">{formData.email}</span>
            </p>

            {emailOtpError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl mb-4 animate-pulse">
                {emailOtpError}
              </div>
            )}

            <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
                  Nhập mã OTP 6 chữ số
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[6px] text-lg font-black px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailOtpModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={emailOtpSubmitting}
                  className="flex-1 bg-zinc-950 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all duration-200 text-sm disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {emailOtpSubmitting ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

