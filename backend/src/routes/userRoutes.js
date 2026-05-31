const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  requestChangeEmailOTP,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả các route bên dưới đều yêu cầu xác thực
router.use(protect);

// Route thông tin cá nhân
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/change-email-otp', requestChangeEmailOTP);

// Các route quản lý sổ địa chỉ
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);

module.exports = router;
