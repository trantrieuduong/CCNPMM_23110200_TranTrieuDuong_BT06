import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2, User, Shield, UserX, UserCheck } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (error) {
      alert('Lỗi tải người dùng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      setTogglingId(id);
      await api.patch(`/admin/users/${id}/toggle-status`);
      fetchUsers();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Người dùng</h1>
          <p className="text-gray-500 text-sm">Quản lý tài khoản và quyền truy cập</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Người dùng</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Vai trò</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Ngày tham gia</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'admin' && <Shield size={10} />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ BỊ KHÓA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleStatus(u._id)}
                      disabled={togglingId === u._id}
                      className={`p-2 rounded-lg transition-colors ${
                        u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {togglingId === u._id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        u.isActive ? <UserX size={18} /> : <UserCheck size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
