const cartRepository = require('../repositories/cartRepository');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class CartService {
  async getCart(userId) {
    let cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      cart = await cartRepository.create({ userId, items: [] });
    }

    // Kiểm tra tính hợp lệ của giỏ hàng (lọc các sản phẩm đã bị xóa hoặc hết hàng)
    let hasChanges = false;
    const activeItems = [];

    for (const item of cart.items) {
      if (!item.productId) {
        hasChanges = true;
        continue;
      }

      const product = await Product.findById(item.productId._id);
      if (!product) {
        hasChanges = true;
        continue;
      }

      if (product.stock <= 0) {
        hasChanges = true;
        continue;
      }

      if (item.quantity > product.stock) {
        item.quantity = product.stock;
        hasChanges = true;
      }

      activeItems.push(item);
    }

    if (hasChanges) {
      cart.items = activeItems;
      await cartRepository.save(cart);
      cart = await cartRepository.findByUserId(userId);
    }

    return cart;
  }

  async addToCart(userId, productId, quantity) {
    if (!quantity || quantity < 1) {
      throw ApiError.badRequest('Số lượng phải lớn hơn hoặc bằng 1');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Không tìm thấy sản phẩm');
    }

    if (product.stock <= 0) {
      throw ApiError.badRequest('Sản phẩm hiện tại đã hết hàng');
    }

    let cart = await cartRepository.findOne({ userId });
    if (!cart) {
      cart = await cartRepository.create({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        throw ApiError.badRequest(`Không thể thêm. Chỉ còn ${product.stock} sản phẩm trong kho`);
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      if (quantity > product.stock) {
        throw ApiError.badRequest(`Không thể thêm. Chỉ còn ${product.stock} sản phẩm trong kho`);
      }
      cart.items.push({ productId, quantity });
    }

    await cartRepository.save(cart);
    return await cartRepository.findByUserId(userId);
  }

  async updateCartItemQuantity(userId, productId, quantity) {
    if (!quantity || quantity < 1) {
      throw ApiError.badRequest('Số lượng phải lớn hơn hoặc bằng 1');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Không tìm thấy sản phẩm');
    }

    const cart = await cartRepository.findOne({ userId });
    if (!cart) {
      throw ApiError.notFound('Không tìm thấy giỏ hàng của người dùng');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw ApiError.notFound('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    if (quantity > product.stock) {
      throw ApiError.badRequest(`Không thể cập nhật. Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    cart.items[itemIndex].quantity = quantity;
    await cartRepository.save(cart);
    return await cartRepository.findByUserId(userId);
  }

  async removeFromCart(userId, productId) {
    const cart = await cartRepository.findOne({ userId });
    if (!cart) {
      throw ApiError.notFound('Không tìm thấy giỏ hàng của người dùng');
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await cartRepository.save(cart);
    return await cartRepository.findByUserId(userId);
  }

  async clearCart(userId) {
    const cart = await cartRepository.findOne({ userId });
    if (!cart) {
      throw ApiError.notFound('Không tìm thấy giỏ hàng của người dùng');
    }

    cart.items = [];
    await cartRepository.save(cart);
    return cart;
  }

  async syncCart(userId, localItems) {
    if (!Array.isArray(localItems)) {
      throw ApiError.badRequest('Dữ liệu đồng bộ phải là một mảng');
    }

    let cart = await cartRepository.findOne({ userId });
    if (!cart) {
      cart = await cartRepository.create({ userId, items: [] });
    }

    for (const localItem of localItems) {
      const { productId, quantity } = localItem;
      if (!productId || !quantity || quantity < 1) continue;

      const product = await Product.findById(productId);
      if (!product || product.stock <= 0) continue;

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        const mergedQuantity = cart.items[itemIndex].quantity + quantity;
        cart.items[itemIndex].quantity = Math.min(mergedQuantity, product.stock);
      } else {
        const initialQuantity = Math.min(quantity, product.stock);
        cart.items.push({ productId, quantity: initialQuantity });
      }
    }

    await cartRepository.save(cart);
    return await cartRepository.findByUserId(userId);
  }
}

module.exports = new CartService();
