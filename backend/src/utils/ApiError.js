class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg) {
    return new ApiError(400, msg || 'Yêu cầu không hợp lệ');
  }

  static unauthorized(msg) {
    return new ApiError(401, msg || 'Không có quyền truy cập');
  }

  static forbidden(msg) {
    return new ApiError(403, msg || 'Bị từ chối truy cập');
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Không tìm thấy tài nguyên');
  }

  static internal(msg) {
    return new ApiError(500, msg || 'Lỗi hệ thống nội bộ');
  }
}

module.exports = ApiError;
