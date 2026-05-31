const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class OrderService {
  async createOrder(userId, shippingAddress) {
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phoneNumber || !shippingAddress.address) {
      throw ApiError.badRequest('Thông tin nhận hàng không được để trống');
    }

    // Lấy giỏ hàng của người dùng
    const cart = await cartRepository.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Giỏ hàng của bạn đang trống, không thể đặt hàng');
    }

    const orderItems = [];
    let totalItemsPrice = 0;

    // Kiểm tra tồn kho của từng sản phẩm và tính toán giá mua thực tế
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw ApiError.notFound(`Không tìm thấy sản phẩm trong hệ thống`);
      }

      if (item.quantity > product.stock) {
        throw ApiError.badRequest(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho`);
      }

      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        quantity: item.quantity,
        price: price,
      });

      totalItemsPrice += price * item.quantity;
    }

    // Phí ship: miễn phí cho đơn hàng từ 1.000.000đ trở lên, ngược lại phí 30.000đ
    const shippingCost = totalItemsPrice >= 1000000 ? 0 : 30000;
    const totalPrice = totalItemsPrice + shippingCost;

    // Tiến hành trừ kho và tăng số lượng bán
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Tạo đơn hàng mới với trạng thái mặc định Pending
    const order = await orderRepository.create({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'COD',
      shippingCost,
      totalPrice,
      status: 'Pending',
    });

    // Làm sạch giỏ hàng của khách hàng sau khi đặt thành công
    cart.items = [];
    await cartRepository.save(cart);

    return order;
  }

  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  }

  async getOrderDetails(userId, orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Không tìm thấy đơn hàng yêu cầu');
    }

    // Đảm bảo người dùng chỉ xem được đơn hàng của chính mình
    if (order.userId._id.toString() !== userId.toString()) {
      throw ApiError.forbidden('Bạn không có quyền truy cập thông tin đơn hàng này');
    }

    return order;
  }

  async cancelOrder(userId, orderId, reason) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Không tìm thấy đơn hàng cần hủy');
    }

    // Chỉ chủ đơn hàng mới có quyền hủy
    if (order.userId._id.toString() !== userId.toString()) {
      throw ApiError.forbidden('Bạn không có quyền thực hiện thao tác này');
    }

    const cancelReasonText = reason ? reason.trim() : '';
    if (!cancelReasonText) {
      throw ApiError.badRequest('Bạn cần cung cấp lý do hủy đơn hàng');
    }

    if (order.status === 'Pending') {
      // Hủy đơn trực tiếp ngay lập tức
      order.status = 'Cancelled';
      order.cancellationReason = cancelReasonText;

      // Hoàn lại số lượng sản phẩm vào kho và trừ đi số lượng đã bán
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
          await product.save();
        }
      }

      await orderRepository.save(order);
      return order;
    } else if (order.status === 'Confirmed' || order.status === 'Processing') {
      // Chuyển sang trạng thái Gửi yêu cầu hủy đơn cho shop nếu đã xác nhận hoặc đang chuẩn bị hàng
      order.status = 'CancellationRequested';
      order.cancellationReason = cancelReasonText;

      await orderRepository.save(order);
      return order;
    } else {
      throw ApiError.badRequest('Đơn hàng đang được giao hoặc đã hoàn thành, bạn không thể hủy đơn');
    }
  }

  // API dành cho Admin
  async adminGetAllOrders(page = 1, limit = 10, status = '') {
    const query = {};
    if (status) {
      query.status = status;
    }

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const orders = await orderRepository.findAll(query, { createdAt: -1 }, skip, parsedLimit);
    const total = await orderRepository.countDocuments(query);

    return {
      orders,
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    };
  }

  async adminUpdateOrderStatus(orderId, status) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Không tìm thấy đơn hàng cần cập nhật');
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'CancellationRequested'];
    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest('Trạng thái đơn hàng không hợp lệ');
    }

    // Nếu chuyển sang Cancelled thì thực hiện hoàn trả kho
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
          await product.save();
        }
      }
    }

    order.status = status;
    await orderRepository.save(order);
    return order;
  }

  async adminHandleCancellationRequest(orderId, decision) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Không tìm thấy đơn hàng cần xử lý');
    }

    if (order.status !== 'CancellationRequested') {
      throw ApiError.badRequest('Đơn hàng này hiện tại không có yêu cầu hủy nào cần xử lý');
    }

    if (decision === 'approve') {
      // Đồng ý yêu cầu hủy
      order.status = 'Cancelled';

      // Hoàn lại kho
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
          await product.save();
        }
      }
    } else if (decision === 'reject') {
      // Từ chối yêu cầu hủy, đưa đơn hàng về lại trạng thái Processing (đang chuẩn bị hàng)
      order.status = 'Processing';
    } else {
      throw ApiError.badRequest('Quyết định xử lý không hợp lệ (yêu cầu "approve" hoặc "reject")');
    }

    await orderRepository.save(order);
    return order;
  }
}

module.exports = new OrderService();
