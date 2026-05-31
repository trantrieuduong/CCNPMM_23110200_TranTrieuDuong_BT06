const userRepository = require('../repositories/userRepository');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

  async getDashboardStats() {
    const totalUsers = await userRepository.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Lấy khoảng thời gian của tháng hiện tại
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Tính doanh thu tháng (chỉ đơn hàng 'Delivered')
    const deliveredOrders = await Order.find({
      status: 'Delivered',
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    const monthlyRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Tính số lượng đơn hàng trong tháng (tất cả các đơn hàng được đặt)
    const monthlyOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    return {
      totalUsers,
      totalCategories,
      totalProducts,
      monthlyRevenue,
      monthlyOrders
    };
  }
}

module.exports = new AdminService();
