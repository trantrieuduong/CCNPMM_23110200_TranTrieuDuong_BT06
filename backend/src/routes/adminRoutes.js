const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  toggleUserStatus,
  getAllOrders,
  updateOrderStatus,
  handleCancellationRequest,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Tất cả các route admin đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Quản lý đơn hàng
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/handle-cancellation', handleCancellationRequest);

module.exports = router;
