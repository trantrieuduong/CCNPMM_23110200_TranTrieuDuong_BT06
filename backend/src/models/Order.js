const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Số lượng sản phẩm phải lớn hơn hoặc bằng 1'],
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Họ tên người nhận không được để trống'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Số điện thoại người nhận không được để trống'],
    },
    address: {
      type: String,
      required: [true, 'Địa chỉ giao hàng không được để trống'],
    },
  },
  paymentMethod: {
    type: String,
    enum: ['COD'],
    default: 'COD',
    required: true,
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      'Pending',               // Đơn hàng mới
      'Confirmed',             // Đã xác nhận đơn hàng
      'Processing',            // Shop đang chuẩn bị hàng
      'Shipping',              // Đang giao hàng
      'Delivered',             // Đã giao thành công
      'Cancelled',             // Hủy đơn hàng
      'CancellationRequested'  // Gửi yêu cầu hủy đơn cho shop
    ],
    default: 'Pending',
  },
  cancellationReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
