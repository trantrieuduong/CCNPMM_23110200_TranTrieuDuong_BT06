const { verifyAccessToken } = require('../utils/jwt.util');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');

// Middleware bảo vệ các route yêu cầu đăng nhập
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Không tìm thấy token truy cập');
    }

    // Giải mã và xác thực token
    const decoded = verifyAccessToken(token);

    // Lấy thông tin người dùng
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('Người dùng không tồn tại hoặc đã bị xóa');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Tài khoản của bạn đã bị khóa');
    }

    // Gán thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    // Nếu là lỗi JWT hoặc lỗi tự định nghĩa
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Phiên đăng nhập hết hạn hoặc không hợp lệ'));
    }
    next(error);
  }
};

// Middleware kiểm tra quyền admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(ApiError.forbidden('Bạn không có quyền truy cập chức năng này'));
  }
};

module.exports = { protect, adminOnly };

