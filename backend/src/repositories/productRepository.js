const Product = require('../models/Product');

class ProductRepository {
  async findAndCount(query, sortQuery, skip, limit) {
    const total = await Product.countDocuments(query);
    const data = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);
    return { total, data };
  }

  async findById(id) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category');
  }

  async findSimilar(categoryId, productId, limit = 4) {
    return await Product.find({
      category: categoryId,
      _id: { $ne: productId }
    })
      .limit(limit)
      .select('name price images slug');
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();
