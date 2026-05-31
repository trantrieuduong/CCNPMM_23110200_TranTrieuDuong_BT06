const productRepository = require('../repositories/productRepository');
const slugify = require('slugify');

class ProductService {
  async getProducts(queryParams) {
    const {
      search, category, minPrice, maxPrice, inStock,
      sort, page = 1, limit = 10
    } = queryParams;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'newest') sortQuery = { createdAt: -1 };
    if (sort === 'bestseller') sortQuery = { sold: -1 };
    if (sort === 'mostviewed') sortQuery = { views: -1 };
    if (sort === 'price_asc') sortQuery = { price: 1 };
    if (sort === 'price_desc') sortQuery = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const { total, data } = await productRepository.findAndCount(
      query,
      sortQuery,
      skip,
      Number(limit)
    );

    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data
    };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm');
      error.statusCode = 404;
      throw error;
    }

    const similarProducts = await productRepository.findSimilar(
      product.category._id,
      product._id
    );

    return { product, similarProducts };
  }

  async createProduct(body, files) {
    const productData = { ...body };

    if (body.name) {
      productData.slug = slugify(body.name, { lower: true });
    }

    if (files) {
      productData.images = files.map(file => file.path.replace(/\\/g, '/'));
    }

    return await productRepository.create(productData);
  }

  async updateProduct(id, body, files) {
    const updateData = { ...body };

    if (body.name) {
      updateData.slug = slugify(body.name, { lower: true });
    }

    if (files && files.length > 0) {
      updateData.images = files.map(file => file.path.replace(/\\/g, '/'));
    }

    const product = await productRepository.update(id, updateData);

    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);

    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm');
      error.statusCode = 404;
      throw error;
    }

    return true;
  }
}

module.exports = new ProductService();
