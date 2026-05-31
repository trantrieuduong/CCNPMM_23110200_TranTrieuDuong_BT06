import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    if (formData.password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="flex justify-center">
            <div className="p-3 bg-red-500 rounded-full text-white text-3xl">
              📝
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Trở thành thành viên của cộng đồng SneakerLab
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
              placeholder="Họ và tên"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
              placeholder="Địa chỉ Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              name="confirmPassword"
              type="password"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                'Đang đăng ký...'
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-black hover:underline">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
