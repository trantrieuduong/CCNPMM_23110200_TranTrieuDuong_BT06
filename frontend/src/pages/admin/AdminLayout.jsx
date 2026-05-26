import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra quyền Admin
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', path: '/admin/products', icon: Package },
    { name: 'Danh mục', path: '/admin/categories', icon: Tags },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Người dùng', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed inset-y-0">
        <div className="p-8">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            SNEAKER<span className="text-red-500">LAB</span>
            <div className="text-[10px] font-bold text-gray-400 -mt-1 uppercase tracking-[0.2em]">Hệ thống Quản trị</div>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center space-x-3 p-4 mb-4 bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="p-2 bg-red-500 rounded-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
