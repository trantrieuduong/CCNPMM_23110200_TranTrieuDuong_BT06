import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

// Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { addToCart } = useCart();
  const [toast, setToast] = useState({ show: false, success: true, message: '' });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
        setSimilarProducts(data.similarProducts || []);
        setQuantity(1);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-red-500 text-4xl">⏳</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="text-red-500 hover:underline">Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  const handleQuantity = (type) => {
    if (type === 'plus') {
      if (quantity < product.stock) setQuantity(prev => prev + 1);
    } else {
      if (quantity > 1) setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    const res = await addToCart(product, quantity);
    setToast({
      show: true,
      success: res.success,
      message: res.message
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300 transform translate-y-0 ${
          toast.success 
            ? 'bg-black text-white border-black' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-black">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-black">Sản phẩm</Link>
        <span className="mx-2">/</span>
        <span className="text-black font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <Swiper
            style={{
              '--swiper-navigation-color': '#000',
              '--swiper-pagination-color': '#000',
            }}
            loop={true}
            spaceBetween={10}
            navigation={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Navigation, Pagination, Thumbs, Autoplay]}
            className="rounded-2xl bg-gray-50"
          >
            {product.images.map((img, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={`${API_BASE}/../${img}`} 
                  alt={product.name} 
                  className="w-full aspect-square object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnail Swiper */}
          {product.images.length > 1 && (
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress={true}
              modules={[Navigation, Pagination, Thumbs]}
              className="mt-4 thumbs-swiper"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index} className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent swiper-slide-thumb-active:border-black">
                  <img src={`${API_BASE}/../${img}`} alt="thumbnail" className="w-full aspect-square object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Link to={`/categories/${product.category?._id}`} className="text-red-500 font-bold text-sm uppercase tracking-widest hover:underline">
              {product.category?.name}
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
              <span className="text-sm text-gray-500 border-l pl-4">Đã bán: {product.sold}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-black text-red-600">
                  {product.discountPrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-black">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-700">Tình trạng:</span>
              {product.stock > 0 ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">CÒN HÀNG ({product.stock})</span>
              ) : (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">HẾT HÀNG</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {product.stock > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <span className="text-sm font-semibold text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button 
                    onClick={() => handleQuantity('minus')}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    ➖
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => handleQuantity('plus')}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    ➕
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center space-x-2 bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all duration-300"
                >
                  <span>🛒 THÊM VÀO GIỎ HÀNG</span>
                </button>
                <button className="p-4 bg-gray-100 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 text-2xl">
                  ⭐
                </button>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full text-2xl">
                🛡️
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Bảo hành 12 tháng</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-green-50 text-green-600 rounded-full text-2xl">
                🚚
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Giao hàng miễn phí</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full text-2xl">
                🔄
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Đổi trả 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pt-20 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">SẢN PHẨM TƯƠNG TỰ</h2>
            <Link to="/products" className="text-red-500 font-bold hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
