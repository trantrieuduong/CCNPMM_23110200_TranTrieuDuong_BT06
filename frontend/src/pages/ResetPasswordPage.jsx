import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'otp' ? value.replace(/\D/g, '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.otp.length !== 6 || isNaN(formData.otp)) {
      return setError('Mã OTP phải gồm 6 chữ số');
    }

    if (formData.newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      if (data.success) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang Đăng nhập...');
        // Chuyển sang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-md">
              *
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed font-medium">
            Nhập mã OTP 6 chữ số nhận được trong hòm thư của <span className="font-bold text-gray-800">{email}</span> để thiết lập mật khẩu mới.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs font-semibold rounded-r-xl animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-xs font-semibold rounded-r-xl">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="otp" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Nhập mã OTP 6 chữ số
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                required
                maxLength={6}
                placeholder="000000"
                value={formData.otp}
                onChange={handleChange}
                className="w-full text-center tracking-[6px] text-lg font-black px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-gray-300"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 hover:bg-red-500 text-white rounded-full font-bold text-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu'}
            </button>

            <Link
              to="/login"
              className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-black transition-colors text-center"
            >
              Hủy bỏ & Quay lại
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
