const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, logout, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route Đăng ký
router.post('/register', register);

// Route Đăng nhập
router.post('/login', login);

// Route làm mới token
router.post('/refresh', refreshToken);

// Route Đăng xuất
router.post('/logout', logout);

// Route lấy thông tin cá nhân (Protected)
router.get('/me', protect, getMe);

// Route cập nhật thông tin cá nhân (Protected)
router.put('/profile', protect, updateProfile);

module.exports = router;
