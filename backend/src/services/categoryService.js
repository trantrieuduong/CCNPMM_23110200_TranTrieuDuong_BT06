const categoryRepository = require('../repositories/categoryRepository');
const slugify = require('slugify');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async createCategory(categoryData) {
    const { name, description, image } = categoryData;

    if (!name) {
      const error = new Error('Tên danh mục là bắt buộc');
      error.statusCode = 400;
      throw error;
    }

    const slug = slugify(name, { lower: true });

    return await categoryRepository.create({
      name,
      slug,
      description,
      image
    });
  }

  async updateCategory(id, updateData) {
    const { name } = updateData;

    if (name) {
      updateData.slug = slugify(name, { lower: true });
    }

    const category = await categoryRepository.update(id, updateData);

    if (!category) {
      const error = new Error('Không tìm thấy danh mục');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  async deleteCategory(id) {
    const category = await categoryRepository.delete(id);

    if (!category) {
      const error = new Error('Không tìm thấy danh mục');
      error.statusCode = 404;
      throw error;
    }

    return true;
  }
}

module.exports = new CategoryService();
