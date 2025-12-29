import React, { useState } from 'react';
import { 
  Package, Users, FileText, TrendingUp, AlertTriangle, 
  LogOut, Menu, X, Plus, Edit2, Trash2, Search,
  Download, Clock, User, ShoppingCart
} from 'lucide-react';

// ==========================================
// 1. COMPONENT ĐĂNG NHẬP
// ==========================================
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Nguyễn Văn A' },
    { username: 'editor', password: 'editor123', role: 'editor', name: 'Trần Thị B' },
    { username: 'viewer', password: 'viewer123', role: 'viewer', name: 'Lê Văn C' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const account = demoAccounts.find(acc => acc.username === username && acc.password === password);
    if (account) onLogin(account);
    else alert('Tên đăng nhập hoặc mật khẩu không đúng!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Kho</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">Đăng nhập</button>
        </form>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p><strong>Admin:</strong> admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPONENT CHÍNH (WAREHOUSE APP)
// ==========================================
const WarehouseApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dữ liệu mẫu
  const [products] = useState([
    { id: 1, sku: 'SP001', name: 'Áo thun nam', unit: 'cái', price: 150000, quantity: 100, minStock: 20, image: '👕' },
    { id: 2, sku: 'SP002', name: 'Quần jean nữ', unit: 'cái', price: 350000, quantity: 5, minStock: 15, image: '👖' },
    { id: 3, sku: 'SP003', name: 'Giày thể thao', unit: 'đôi', price: 500000, quantity: 30, minStock: 10, image: '👟' },
  ]);

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  // Sidebar Component nội bộ
  const Sidebar = () => (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 hidden md:block fixed">
      <div className="flex items-center space-x-3 mb-8">
        <Package className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold">Kho Brown</h1>
      </div>
      <nav className="space-y-2">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
          <TrendingUp className="w-5 h-5" /> <span>Tổng quan</span>
        </button>
        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
          <Package className="w-5 h-5" /> <span>Hàng hóa</span>
        </button>
        {currentUser.role === 'admin' && (
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
            <Users className="w-5 h-5" /> <span>Người dùng</span>
          </button>
        )}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 rounded-lg hover:bg-red-700">
          <LogOut className="w-5 h-5" /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  // Render nội dung các Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tổng quan kho</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
                <p>Tổng sản phẩm</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
                <p>Cảnh báo hết hàng</p>
                <p className="text-3xl font-bold">{products.filter(p => p.quantity < p.minStock).length}</p>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Danh sách hàng hóa</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm hàng
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-sm">
                  <tr>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Tồn kho</th>
                    <th className="p-4">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3"><span className="text-2xl">{p.image}</span> {p.name}</td>
                      <td className="p-4">{p.sku}</td>
                      <td className={`p-4 font-bold ${p.quantity < p.minStock ? 'text-red-500' : 'text-green-600'}`}>{p.quantity} {p.unit}</td>
                      <td className="p-4">{p.price.toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return <div className="p-8 text-center text-gray-500">Tính năng đang phát triển...</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default WarehouseApp;