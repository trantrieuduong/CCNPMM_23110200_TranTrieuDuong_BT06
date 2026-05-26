import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-gray-300 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold tracking-tighter">
              SNEAKER<span className="text-red-500">LAB</span>
            </h3>
            <p className="text-sm">
              Điểm đến uy tín cho các tín đồ sneaker. Chúng tôi cung cấp những mẫu giày mới nhất và chất lượng nhất.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Mua sắm</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-500 transition-colors">Tất cả sản phẩm</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Giày Nam</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Giày Nữ</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Phụ kiện</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-500 transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Hướng dẫn chọn size</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Vận chuyển</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} SNEAKERLAB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
