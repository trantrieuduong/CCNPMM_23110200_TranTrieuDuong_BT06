const userRepository = require('../repositories/userRepository');

class AdminService {
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const total = await userRepository.countDocuments();
    const users = await userRepository.findPaged({}, skip, limit);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  }

  async toggleUserStatus(targetUserId, adminId) {
    const user = await userRepository.findById(targetUserId);

    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.statusCode = 404;
      throw error;
    }

    // Không cho phép admin tự khóa tài khoản của chính mình
    if (user._id.toString() === adminId.toString()) {
      const error = new Error('Bạn không thể tự khóa tài khoản của chính mình');
      error.statusCode = 400;
      throw error;
    }

    user.isActive = !user.isActive;
    await userRepository.save(user);

    return {
      email: user.email,
      isActive: user.isActive,
      id: user._id
    };
  }
}

module.exports = new AdminService();
