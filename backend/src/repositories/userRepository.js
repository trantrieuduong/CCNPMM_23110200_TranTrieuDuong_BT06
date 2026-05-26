const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  async create(userData) {
    return await User.create(userData);
  }

  async exists(email) {
    return await User.exists({ email });
  }

  async countDocuments(query = {}) {
    return await User.countDocuments(query);
  }

  async findPaged(query = {}, skip = 0, limit = 10, sort = { createdAt: -1 }) {
    return await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async save(user) {
    return await user.save();
  }
}

module.exports = new UserRepository();
