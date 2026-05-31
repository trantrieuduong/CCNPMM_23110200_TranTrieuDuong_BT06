import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Bộ đếm ngược gửi lại mã OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6 || isNaN(otp)) {
      return setError('Mã OTP phải gồm 6 chữ số');
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      
      if (data.success) {
        setSuccess('Kích hoạt tài khoản thành công! Đang chuyển về trang chủ...');
        
        // Tự động lưu thông tin đăng nhập vào localStorage và cập nhật AuthContext
        const authData = {
          ...data.data,
          accessToken: data.accessToken
        };
        localStorage.setItem('userInfo', JSON.stringify(authData));
        
        // Đợi 2 giây rồi chuyển hướng về trang chủ
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực thất bại. Vui lòng kiểm tra lại mã.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/resend-verify-otp', { email });
      setSuccess('Đã gửi mã OTP mới tới địa chỉ email của bạn.');
      setResendCountdown(60); // Đếm ngược 60 giây trước khi cho gửi lại lần nữa
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-md">
              @
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight">
            Xác thực tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed font-medium">
            Chúng tôi đã gửi mã kích hoạt gồm 6 chữ số đến địa chỉ email: <span className="font-bold text-gray-800">{email}</span>
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
            <label htmlFor="otp" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Nhập mã OTP 6 chữ số
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              required
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[12px] text-2xl font-black py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-950 hover:bg-red-500 text-white rounded-full font-bold text-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              {isSubmitting ? 'Đang kích hoạt...' : 'Kích hoạt tài khoản'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-black transition-colors disabled:opacity-50"
            >
              {resendCountdown > 0 
                ? `Gửi lại mã OTP sau ${resendCountdown} giây` 
                : 'Chưa nhận được mã? Gửi lại ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
