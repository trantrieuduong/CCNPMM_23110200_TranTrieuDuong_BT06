import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        setSuccess('Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.');
        // Chuyển hướng sang ResetPassword sau 1.5 giây
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Yêu cầu thất bại. Vui lòng kiểm tra lại địa chỉ email.');
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
              ?
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed font-medium">
            Nhập địa chỉ email của bạn dưới đây và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu tài khoản.
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Địa chỉ Email của bạn
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black focus:border-black text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 hover:bg-red-500 text-white rounded-full font-bold text-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi mã OTP'}
            </button>

            <Link
              to="/login"
              className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-black transition-colors text-center"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
