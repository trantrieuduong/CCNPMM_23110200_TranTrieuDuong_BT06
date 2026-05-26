import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [resNew, resBest, resPromo] = await Promise.all([
          api.get('/products?sort=newest&limit=8'),
          api.get('/products?sort=bestseller&limit=8'),
          api.get('/products?sort=price_asc&limit=4')
        ]);

        setNewProducts(resNew.data.data);
        setBestSellers(resBest.data.data);
        setPromoProducts(resPromo.data.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const SectionHeader = ({ title, emoji, link }) => (
    <div className="flex justify-between items-end mb-8">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-black rounded-lg text-white text-xl">
          {emoji}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      <Link to={link} className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center group">
        Xem tất cả <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop" 
            alt="Sneaker Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            {user && (
              <div className="inline-block px-4 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-widest animate-bounce">
                Chào mừng trở lại, {user.name}!
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
              NÂNG TẦM <br />
              <span className="text-red-500">PHONG CÁCH</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-lg">
              Khám phá bộ sưu tập Sneaker mới nhất từ các thương hiệu hàng đầu thế giới. Ưu đãi lên đến 50% chỉ trong tuần này.
            </p>
            <div className="flex space-x-4">
              <Link to="/products" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all duration-300">
                Mua Sắm Ngay
              </Link>
              <Link to="/register" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all duration-300">
                Tham Gia Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <section>
          <SectionHeader title="Sản phẩm mới nhất" emoji="✨" link="/products?sort=newest" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading 
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : newProducts.map(product => <ProductCard key={product._id} product={product} />)
            }
          </div>
        </section>

        <section className="bg-red-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-[2rem]">
          <SectionHeader title="Khuyến mãi cực sốc" emoji="⚡" link="/products?minPrice=0" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading 
              ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : promoProducts.map(product => <ProductCard key={product._id} product={product} />)
            }
          </div>
        </section>

        <section>
          <SectionHeader title="Bán chạy nhất" emoji="📈" link="/products?sort=bestseller" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading 
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : bestSellers.map(product => <ProductCard key={product._id} product={product} />)
            }
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
