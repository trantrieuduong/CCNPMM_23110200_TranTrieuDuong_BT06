const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
