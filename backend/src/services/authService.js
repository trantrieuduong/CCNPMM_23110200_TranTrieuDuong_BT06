const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');

class AuthService {
  async register(userData) {
    const { name, email, password } = userData;

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw ApiError.badRequest('Email này đã được sử dụng');
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      role: 'user',
    });

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

  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        throw ApiError.forbidden('Tài khoản của bạn đã bị khóa');
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

  async updateProfile(userId, updateData) {
    const { name, email } = updateData;

    // Nếu cập nhật email, kiểm tra xem email đã tồn tại chưa
    if (email) {
      const userExists = await userRepository.findByEmail(email);
      if (userExists && userExists._id.toString() !== userId.toString()) {
        throw ApiError.badRequest('Email này đã được sử dụng bởi người dùng khác');
      }
    }

    const updatedUser = await userRepository.updateById(userId, { name, email });
    
    if (!updatedUser) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }

    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Không tìm thấy người dùng');
    }
    return user;
  }
}

module.exports = new AuthService();

