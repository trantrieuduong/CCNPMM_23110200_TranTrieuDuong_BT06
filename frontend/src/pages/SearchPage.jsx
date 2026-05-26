import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard, { ProductSkeleton } from '../components/ProductCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryString = searchParams.toString();
      const { data } = await api.get(`/products?${queryString}`);
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentParams = Object.fromEntries(searchParams.entries());
      if (searchInput) {
        setSearchParams({ ...currentParams, search: searchInput, page: 1 });
      } else {
        const { search, ...rest } = currentParams;
        setSearchParams(rest);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const updateFilter = (key, value) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    if (value) {
      setSearchParams({ ...currentParams, [key]: value, page: 1 });
    } else {
      const { [key]: deletedKey, ...rest } = currentParams;
      setSearchParams(rest);
    }
  };

  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page: newPage });
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Filter - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 space-y-10">
          <div className="flex items-center space-x-3 pb-6 border-b-2 border-gray-100">
            <span className="text-2xl">⚙️</span>
            <h2 className="font-black text-xl tracking-tighter uppercase">Bộ lọc</h2>
          </div>

          {/* Categories */}
          <div className="space-y-5">
            <h3 className="font-black text-xs uppercase text-gray-400 tracking-[0.2em]">Danh mục</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  className="w-5 h-5 accent-black border-gray-300 focus:ring-0"
                  checked={!searchParams.get('category')}
                  onChange={() => updateFilter('category', '')}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors uppercase tracking-tight">Tất cả</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    className="w-5 h-5 accent-black border-gray-300 focus:ring-0"
                    checked={searchParams.get('category') === cat._id}
                    onChange={() => updateFilter('category', cat._id)}
                  />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors uppercase tracking-tight">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-5">
            <h3 className="font-black text-xs uppercase text-gray-400 tracking-[0.2em]">Khoảng giá (₫)</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Từ"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-black outline-none transition-all"
                value={searchParams.get('minPrice') || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <input
                type="number"
                placeholder="Đến"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-black outline-none transition-all"
                value={searchParams.get('maxPrice') || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Stock Toggle */}
          <div className="space-y-5">
            <h3 className="font-black text-xs uppercase text-gray-400 tracking-[0.2em]">Tình trạng</h3>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 accent-black border-gray-300 rounded focus:ring-0"
                checked={searchParams.get('inStock') === 'true'}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
              />
              <span className="text-sm font-bold text-gray-600 group-hover:text-black transition-colors uppercase tracking-tighter whitespace-nowrap">Sản phẩm còn hàng</span>
            </label>
          </div>
        </aside>

        <main className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-xl">
                🔍
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm mẫu giày của bạn..."
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button 
                onClick={() => setShowMobileFilter(true)}
                className="md:hidden flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold"
              >
                <span>🔍</span>
                <span>Lọc</span>
              </button>
              
              <select 
                className="flex-grow sm:flex-grow-0 px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="mostviewed">Xem nhiều nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {!loading && (
            <div className="text-sm text-gray-500">
              Tìm thấy <span className="font-bold text-black">{products.length}</span> sản phẩm 
              {searchParams.get('search') && <span> cho "{searchParams.get('search')}"</span>}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-gray-50 rounded-3xl">
                <div className="inline-block p-4 bg-gray-200 rounded-full text-gray-400 text-5xl">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-gray-900">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-10">
              <button
                disabled={Number(searchParams.get('page') || 1) === 1}
                onClick={() => handlePageChange(Number(searchParams.get('page') || 1) - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black text-xl"
              >
                ◀️
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                    Number(searchParams.get('page') || 1) === i + 1
                      ? 'bg-black text-white'
                      : 'border border-gray-200 hover:border-black'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={Number(searchParams.get('page') || 1) === totalPages}
                onClick={() => handlePageChange(Number(searchParams.get('page') || 1) + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black text-xl"
              >
                ▶️
              </button>
            </div>
          )}
        </main>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
          <div className="relative w-80 bg-white h-full p-6 space-y-8 animate-slide-right">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-xl">LỌC SẢN PHẨM</h2>
              <span className="cursor-pointer text-xl" onClick={() => setShowMobileFilter(false)}>❌</span>
            </div>
            <p className="text-gray-500 text-sm">Vui lòng sử dụng các tùy chọn lọc trên Desktop để có trải nghiệm tốt nhất.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
