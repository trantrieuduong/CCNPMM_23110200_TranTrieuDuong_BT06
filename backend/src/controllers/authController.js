const authService = require('../services/authService');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/cookie.util');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    // Thiết lập refresh token vào cookie
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      accessToken: result.accessToken,
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

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    
    res.json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
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

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

