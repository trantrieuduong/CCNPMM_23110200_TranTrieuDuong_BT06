const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  logout,
  verifyEmail,
  resendVerifyOTP,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Route Đăng ký
router.post('/register', register);

// Route Đăng nhập
router.post('/login', login);

// Route Xác thực Email Đăng ký
router.post('/verify-email', verifyEmail);

// Route Gửi lại mã kích hoạt Email
router.post('/resend-verify-otp', resendVerifyOTP);

// Route Yêu cầu Quên mật khẩu
router.post('/forgot-password', forgotPassword);

// Route Đặt lại mật khẩu mới bằng OTP
router.post('/reset-password', resetPassword);

// Route làm mới token
router.post('/refresh', refreshToken);

// Route Đăng xuất
router.post('/logout', logout);

module.exports = router;
