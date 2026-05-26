const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    return await Category.find();
  }

  async findById(id) {
    return await Category.findById(id);
  }

  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  async findByName(name) {
    return await Category.findOne({ name });
  }
}

module.exports = new CategoryRepository();
