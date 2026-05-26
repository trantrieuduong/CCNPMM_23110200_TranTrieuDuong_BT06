import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Upload } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    stock: 0,
    category: '',
    isFeatured: false,
    tags: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories')
      ]);
      setProducts(resProd.data.data);
      setCategories(resCat.data.data);
    } catch (error) {
      alert('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        stock: product.stock,
        category: product.category?._id || '',
        isFeatured: product.isFeatured,
        tags: product.tags?.join(', ') || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        discountPrice: 0,
        stock: 0,
        category: '',
        isFeatured: false,
        tags: ''
      });
    }
    setSelectedFiles([]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
      } else {
        await api.post('/products', data);
      }
      fetchData();
      setModalOpen(false);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Sản phẩm</h1>
          <p className="text-gray-500 text-sm">Kho hàng hiện có {products.length} mẫu giày</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
        >
          <Plus size={20} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Giá</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Kho</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Danh mục</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={`${API_BASE}/../${p.images[0]}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-[10px] font-mono text-gray-400">{p._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{p.price.toLocaleString()}₫</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock} sản phẩm
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Tên giày</label>
              <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Giá gốc (₫)</label>
              <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Giá khuyến mãi (₫)</label>
              <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                value={formData.discountPrice} onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Số lượng tồn kho</label>
              <input type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-1">Danh mục</label>
              <select required className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Mô tả</label>
            <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black" rows="3"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Hình ảnh (Tối đa 5)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-black transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                    <span>Tải ảnh lên</span>
                    <input type="file" multiple className="sr-only" onChange={(e) => setSelectedFiles(e.target.files)} />
                  </label>
                  <p className="pl-1">hoặc kéo thả vào đây</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP lên đến 5MB mỗi ảnh</p>
                {selectedFiles.length > 0 && <p className="text-xs font-bold text-green-600">Đã chọn {selectedFiles.length} ảnh</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="submit" disabled={isSubmitting} className="flex-grow bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all">
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : (editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
