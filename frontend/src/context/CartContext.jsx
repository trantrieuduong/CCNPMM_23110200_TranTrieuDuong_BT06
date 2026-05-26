import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  // Hàm tính toán tổng số lượng và tổng tiền cho khách vãng lai
  const calculateCartTotals = (items) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => {
      const price = item.productId.discountPrice > 0 ? item.productId.discountPrice : item.productId.price;
      return total + price * item.quantity;
    }, 0);
    return { items, totalItems, totalPrice };
  };

  // Lấy giỏ hàng
  const fetchCart = async () => {
    setLoading(true);
    try {
      if (user) {
        const { data } = await api.get('/cart');
        if (data.success && data.data) {
          const items = data.data.items || [];
          const totalItems = items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = items.reduce((total, item) => {
            if (!item.productId) return total;
            const price = item.productId.discountPrice > 0 ? item.productId.discountPrice : item.productId.price;
            return total + price * item.quantity;
          }, 0);
          setCart({ items, totalItems, totalPrice });
        }
      } else {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const parsedCart = JSON.parse(guestCart);
          setCart(calculateCartTotals(parsedCart));
        } else {
          setCart({ items: [], totalItems: 0, totalPrice: 0 });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ giỏ hàng LocalStorage lên Backend
  const syncCartWithBackend = async () => {
    setLoading(true);
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart && user) {
        const parsedCart = JSON.parse(guestCart);
        if (parsedCart.length > 0) {
          // Chuyển đổi guestCart sang định dạng backend [{ productId, quantity }]
          const syncItems = parsedCart.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity
          }));

          const { data } = await api.post('/cart/sync', { items: syncItems });
          if (data.success) {
            localStorage.removeItem('guestCart');
          }
        }
      }
      // Load lại giỏ hàng từ backend sau khi đồng bộ (hoặc nếu không có gì để đồng bộ)
      await fetchCart();
    } catch (error) {
      console.error('Lỗi khi đồng bộ giỏ hàng:', error);
      await fetchCart();
    } finally {
      setLoading(false);
    }
  };

  // Theo dõi thay đổi của user để tự động tải và đồng bộ giỏ hàng
  useEffect(() => {
    if (user) {
      syncCartWithBackend();
    } else {
      fetchCart();
    }
  }, [user]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    try {
      if (user) {
        const { data } = await api.post('/cart/add', {
          productId: product._id,
          quantity
        });
        if (data.success) {
          const items = data.data.items || [];
          const totalItems = items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = items.reduce((total, item) => {
            if (!item.productId) return total;
            const price = item.productId.discountPrice > 0 ? item.productId.discountPrice : item.productId.price;
            return total + price * item.quantity;
          }, 0);
          setCart({ items, totalItems, totalPrice });
          return { success: true, message: 'Đã thêm vào giỏ hàng' };
        }
      } else {
        // Xử lý LocalStorage cho khách vãng lai
        const guestCart = localStorage.getItem('guestCart');
        let currentItems = guestCart ? JSON.parse(guestCart) : [];

        const existingIndex = currentItems.findIndex(item => item.productId._id === product._id);
        
        if (existingIndex > -1) {
          const newQty = currentItems[existingIndex].quantity + quantity;
          if (newQty > product.stock) {
            return { 
              success: false, 
              message: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stock} sản phẩm trong kho` 
            };
          }
          currentItems[existingIndex].quantity = newQty;
        } else {
          if (quantity > product.stock) {
            return { 
              success: false, 
              message: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stock} sản phẩm trong kho` 
            };
          }
          currentItems.push({
            productId: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              discountPrice: product.discountPrice,
              images: product.images,
              stock: product.stock
            },
            quantity
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        setCart(calculateCartTotals(currentItems));
        return { success: true, message: 'Đã thêm vào giỏ hàng' };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng'
      };
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (productId, quantity) => {
    try {
      if (user) {
        const { data } = await api.put('/cart/update', {
          productId,
          quantity
        });
        if (data.success) {
          const items = data.data.items || [];
          const totalItems = items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = items.reduce((total, item) => {
            if (!item.productId) return total;
            const price = item.productId.discountPrice > 0 ? item.productId.discountPrice : item.productId.price;
            return total + price * item.quantity;
          }, 0);
          setCart({ items, totalItems, totalPrice });
          return { success: true };
        }
      } else {
        const guestCart = localStorage.getItem('guestCart');
        if (!guestCart) return { success: false, message: 'Giỏ hàng trống' };

        let currentItems = JSON.parse(guestCart);
        const itemIndex = currentItems.findIndex(item => item.productId._id === productId);

        if (itemIndex > -1) {
          const product = currentItems[itemIndex].productId;
          if (quantity > product.stock) {
            return { 
              success: false, 
              message: `Số lượng vượt quá tồn kho. Chỉ còn ${product.stock} sản phẩm trong kho` 
            };
          }
          currentItems[itemIndex].quantity = quantity;
          localStorage.setItem('guestCart', JSON.stringify(currentItems));
          setCart(calculateCartTotals(currentItems));
          return { success: true };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật số lượng'
      };
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    try {
      if (user) {
        const { data } = await api.delete(`/cart/remove/${productId}`);
        if (data.success) {
          const items = data.data.items || [];
          const totalItems = items.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = items.reduce((total, item) => {
            if (!item.productId) return total;
            const price = item.productId.discountPrice > 0 ? item.productId.discountPrice : item.productId.price;
            return total + price * item.quantity;
          }, 0);
          setCart({ items, totalItems, totalPrice });
          return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
        }
      } else {
        const guestCart = localStorage.getItem('guestCart');
        if (!guestCart) return { success: false };

        let currentItems = JSON.parse(guestCart);
        currentItems = currentItems.filter(item => item.productId._id !== productId);

        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        setCart(calculateCartTotals(currentItems));
        return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa sản phẩm'
      };
    }
  };

  // Xóa sạch giỏ hàng
  const clearCart = async () => {
    try {
      if (user) {
        const { data } = await api.delete('/cart/clear');
        if (data.success) {
          setCart({ items: [], totalItems: 0, totalPrice: 0 });
        }
      } else {
        localStorage.removeItem('guestCart');
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi làm sạch giỏ hàng:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, syncCartWithBackend }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
