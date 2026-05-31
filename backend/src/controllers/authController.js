const authService = require('../services/authService');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/cookie.util');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Thiết lập refresh token vào cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      accessToken: result.accessToken,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xác thực email đăng ký bằng OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);

    // Xác thực thành công thì set cookie đăng nhập luôn cho người dùng
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      message: 'Xác thực địa chỉ email và kích hoạt tài khoản thành công',
      accessToken: result.accessToken,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Gửi lại mã OTP kích hoạt email
// @route   POST /api/auth/resend-verify-otp
// @access  Public
exports.resendVerifyOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerifyOTP(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Yêu cầu đặt lại mật khẩu (quên mật khẩu)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xác thực OTP và đặt lại mật khẩu mới
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Làm mới Access Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refreshToken(token);

    // Xoay vòng (Rotate) refresh token
    setRefreshTokenCookie(res, result.refreshToken);

    res.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng xuất
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    clearRefreshTokenCookie(res);
    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    next(error);
  }
};

