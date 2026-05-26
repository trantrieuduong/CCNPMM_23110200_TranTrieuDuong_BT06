const Cart = require('../models/Cart');

class CartRepository {
  async findByUserId(userId) {
    return await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name slug price discountPrice images stock isNew'
    });
  }

  async findOne(query) {
    return await Cart.findOne(query);
  }

  async create(cartData) {
    const cart = new Cart(cartData);
    return await cart.save();
  }

  async save(cartInstance) {
    return await cartInstance.save();
  }

  async deleteOne(query) {
    return await Cart.deleteOne(query);
  }
}

module.exports = new CartRepository();
