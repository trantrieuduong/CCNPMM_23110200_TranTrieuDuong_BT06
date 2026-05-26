const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  async findById(id) {
    return await Order.findById(id)
      .populate({
        path: 'items.productId',
        select: 'name slug price discountPrice images stock sold',
      })
      .populate({
        path: 'userId',
        select: 'fullName email phoneNumber',
      });
  }

  async findByUserId(userId) {
    return await Order.find({ userId })
      .populate({
        path: 'items.productId',
        select: 'name slug price discountPrice images stock sold',
      })
      .sort({ createdAt: -1 });
  }

  async findAll(query = {}, sort = { createdAt: -1 }, skip = 0, limit = 10) {
    return await Order.find(query)
      .populate({
        path: 'userId',
        select: 'fullName email phoneNumber',
      })
      .populate({
        path: 'items.productId',
        select: 'name slug price discountPrice images stock sold',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(query = {}) {
    return await Order.countDocuments(query);
  }

  async save(orderInstance) {
    return await orderInstance.save();
  }
}

module.exports = new OrderRepository();
