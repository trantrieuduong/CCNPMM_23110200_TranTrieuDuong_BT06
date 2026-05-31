const userService = require('../services/userService');

// @desc    Yêu cầu OTP thay đổi địa chỉ email
// @route   POST /api/users/change-email-otp
// @access  Private
exports.requestChangeEmailOTP = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    const result = await userService.requestChangeEmailOTP(req.user.id, newEmail);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user.id);
    
    res.json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách địa chỉ của người dùng
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(req.user.id);
    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm địa chỉ mới
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ giao hàng thành công',
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật địa chỉ
// @route   PUT /api/users/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const addresses = await userService.updateAddress(req.user.id, addressId, req.body);
    res.json({
      success: true,
      message: 'Cập nhật địa chỉ giao hàng thành công',
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const addresses = await userService.deleteAddress(req.user.id, addressId);
    res.json({
      success: true,
      message: 'Xóa địa chỉ giao hàng thành công',
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đặt địa chỉ làm mặc định
// @route   PATCH /api/users/addresses/:addressId/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const addresses = await userService.setDefaultAddress(req.user.id, addressId);
    res.json({
      success: true,
      message: 'Đặt địa chỉ mặc định thành công',
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};
