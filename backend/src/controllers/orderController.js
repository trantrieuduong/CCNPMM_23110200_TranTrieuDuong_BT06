const orderService = require('../services/orderService');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const order = await orderService.createOrder(req.user._id, shippingAddress);
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy lịch sử đơn hàng của người dùng hiện tại
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderDetails(req.user._id, id);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hủy hoặc gửi yêu cầu hủy đơn hàng
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.user._id, id, reason);
    
    let message = 'Hủy đơn hàng thành công';
    if (order.status === 'CancellationRequested') {
      message = 'Đã gửi yêu cầu hủy đơn hàng cho shop thành công';
    }

    res.json({
      success: true,
      message,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
