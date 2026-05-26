const cartService = require('../services/cartService');

// @desc    Lấy giỏ hàng hiện tại của người dùng
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, Number(quantity));
    res.json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(req.user._id, productId, Number(quantity));
    res.json({
      success: true,
      message: 'Đã cập nhật số lượng sản phẩm',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeFromCart(req.user._id, productId);
    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sạch giỏ hàng
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);
    res.json({
      success: true,
      message: 'Đã làm sạch giỏ hàng',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đồng bộ giỏ hàng từ LocalStorage
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const cart = await cartService.syncCart(req.user._id, items);
    res.json({
      success: true,
      message: 'Đã đồng bộ hóa giỏ hàng thành công',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};
