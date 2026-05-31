const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');
const redis = require('../config/redis');
const emailService = require('./emailService');

class AuthService {
  // Sinh mã OTP 6 chữ số ngẫu nhiên
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(userData) {
    const { name, email, password } = userData;

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw ApiError.badRequest('Email này đã được sử dụng');
    }

    // Tạo người dùng ở trạng thái chưa được kích hoạt (isActive: false)
    const user = await userRepository.create({
      name,
      email,
      password,
      role: 'user',
      isActive: false // Đăng ký mới cần được xác thực email
    });

    // Sinh mã OTP và lưu vào Redis với TTL 5 phút (300 giây)
    const otp = this.generateOTP();
    const redisKey = `otp:verify-email:${email}`;
    await redis.setOTP(redisKey, otp, 300);

    // Gửi email chứa mã OTP kích hoạt
    await emailService.sendOTPEmail(email, otp, 'verify-email');

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      message: 'Đăng ký tài khoản thành công. Vui lòng xác thực mã OTP đã gửi tới email của bạn.'
    };
  }

  // Xác thực email để kích hoạt tài khoản
  async verifyEmail(email, otp) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }

    if (user.isActive) {
      throw ApiError.badRequest('Tài khoản này đã được kích hoạt từ trước');
    }

    // Lấy OTP từ Redis
    const redisKey = `otp:verify-email:${email}`;
    const cachedOtp = await redis.getOTP(redisKey);

    if (!cachedOtp) {
      throw ApiError.badRequest('Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã mới.');
    }

    if (cachedOtp !== otp.toString()) {
      throw ApiError.badRequest('Mã OTP không chính xác');
    }

    // Kích hoạt tài khoản
    user.isActive = true;
    await userRepository.save(user);

    // Xóa OTP khỏi Redis sau khi verify thành công
    await redis.deleteOTP(redisKey);

    // Trả về token đăng nhập trực tiếp
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: generateAccessToken(user._id, user.role),
      refreshToken: generateRefreshToken(user._id),
    };
  }

  // Gửi lại mã OTP xác thực email
  async resendVerifyOTP(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }

    if (user.isActive) {
      throw ApiError.badRequest('Tài khoản này đã được kích hoạt từ trước');
    }

    // Sinh OTP mới, lưu Redis và gửi email
    const otp = this.generateOTP();
    const redisKey = `otp:verify-email:${email}`;
    await redis.setOTP(redisKey, otp, 300);
    await emailService.sendOTPEmail(email, otp, 'verify-email');

    return {
      success: true,
      message: 'Đã gửi lại mã OTP kích hoạt thành công.'
    };
  }

  // Yêu cầu quên mật khẩu (gửi OTP)
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy tài khoản với email này');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Tài khoản của bạn chưa được kích hoạt. Vui lòng kích hoạt email trước.');
    }

    // Sinh OTP quên mật khẩu
    const otp = this.generateOTP();
    const redisKey = `otp:reset-password:${email}`;
    await redis.setOTP(redisKey, otp, 300);

    // Gửi email OTP đặt lại mật khẩu
    await emailService.sendOTPEmail(email, otp, 'reset-password');

    return {
      success: true,
      message: 'Mã OTP đặt lại mật khẩu đã được gửi tới email của bạn.'
    };
  }

  // Đặt lại mật khẩu mới bằng OTP
  async resetPassword(email, otp, newPassword) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }

    // Kiểm tra OTP trong Redis
    const redisKey = `otp:reset-password:${email}`;
    const cachedOtp = await redis.getOTP(redisKey);

    if (!cachedOtp) {
      throw ApiError.badRequest('Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu gửi lại mã.');
    }

    if (cachedOtp !== otp.toString()) {
      throw ApiError.badRequest('Mã OTP không chính xác');
    }

    // Cập nhật mật khẩu mới (phải gọi save() để kích hoạt middleware pre('save') mã hóa mật khẩu)
    user.password = newPassword;
    await userRepository.save(user);

    // Xóa OTP khỏi Redis
    await redis.deleteOTP(redisKey);

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.'
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        throw ApiError.forbidden('TÀI_KHOẢN_CHƯA_KÍCH_HOẠT');
      }

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: generateAccessToken(user._id, user.role),
        refreshToken: generateRefreshToken(user._id),
      };
    } else {
      throw ApiError.unauthorized('Email hoặc mật khẩu không chính xác');
    }
  }

  async refreshToken(token) {
    if (!token) {
      throw ApiError.unauthorized('Không tìm thấy Refresh Token');
    }

    const decoded = verifyRefreshToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Người dùng không hợp lệ hoặc đã bị khóa');
    }

    return {
      accessToken: generateAccessToken(user._id, user.role),
      refreshToken: generateRefreshToken(user._id), // Rotate refresh token
    };
  }
}

module.exports = new AuthService();

