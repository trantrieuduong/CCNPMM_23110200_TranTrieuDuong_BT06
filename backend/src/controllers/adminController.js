const adminService = require('../services/adminService');
const orderService = require('../services/orderService');

// @desc    Lấy danh sách tất cả người dùng (Phân trang)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await adminService.getAllUsers(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt trạng thái hoạt động của người dùng
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const result = await adminService.toggleUserStatus(req.params.id, req.user._id);

    res.json({
      success: true,
      message: `Tài khoản ${result.email} đã được ${result.isActive ? 'kích hoạt' : 'khóa'}`,
      data: {
        id: result.id,
        isActive: result.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách tất cả đơn hàng (Phân trang, lọc theo status)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || '';

    const result = await orderService.adminGetAllOrders(page, limit, status);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.adminUpdateOrderStatus(id, status);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xử lý yêu cầu hủy đơn hàng từ khách hàng (Đồng ý hoặc Từ chối)
// @route   POST /api/admin/orders/:id/handle-cancellation
// @access  Private/Admin
exports.handleCancellationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' hoặc 'reject'

    const order = await orderService.adminHandleCancellationRequest(id, decision);

    const message = decision === 'approve' 
      ? 'Đã chấp nhận yêu cầu hủy đơn hàng và hoàn lại kho thành công' 
      : 'Đã từ chối yêu cầu hủy đơn hàng, đơn hàng được khôi phục về trạng thái chuẩn bị';

    res.json({
      success: true,
      message,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thống kê trang tổng quan (Dashboard)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

