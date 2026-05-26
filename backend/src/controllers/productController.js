const productService = require('../services/productService');

// @desc    Lấy tất cả sản phẩm với bộ lọc, sắp xếp và phân trang
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết sản phẩm và các sản phẩm tương tự
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const { product, similarProducts } = await productService.getProductById(req.params.id);

    res.json({
      success: true,
      data: product,
      similarProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo sản phẩm mới (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.files);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật sản phẩm (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.files);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sản phẩm (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error) {
    next(error);
  }
};

