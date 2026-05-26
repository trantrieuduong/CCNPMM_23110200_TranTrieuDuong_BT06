const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả các route liên quan đến đơn hàng của người dùng đều yêu cầu đăng nhập
router.use(protect);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderDetails);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
