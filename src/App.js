import React, { useState, useEffect } from 'react';
import { 
  Package, Users, FileText, TrendingUp, AlertTriangle, 
  LogOut, Menu, X, Plus, Edit2, Trash2, Eye, Search,
  Download, Bell, Clock, User, ShoppingCart, CheckCircle
} from 'lucide-react';

// Component đăng nhập
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
    const account = demoAccounts.find(
      acc => acc.username === username && acc.password === password
    );
    if (account) {
      onLogin(account);
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phiếu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{issue.code}</td>
                    <td className="px-6 py-4 text-sm">{issue.date}</td>
                    <td className="px-6 py-4 text-sm">{issue.reason}</td>
                    <td className="px-6 py-4 text-sm">{issue.user}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Component Báo cáo
  const Reports = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Báo cáo Tồn kho
            </h3>
            <p className="text-gray-600 mb-4">Xuất danh sách hàng hóa và số lượng tồn kho hiện tại</p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Báo cáo Nhập - Xuất - Tồn
            </h3>
            <p className="text-gray-600 mb-4">Tổng hợp nhập xuất tồn theo khoảng thời gian</p>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input type="date" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <input type="date" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full justify-center">
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Cảnh báo Tồn kho
            </h3>
            <p className="text-gray-600 mb-4">Danh sách hàng hóa dưới mức tồn tối thiểu</p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Báo cáo Giá trị Kho
            </h3>
            <p className="text-gray-600 mb-4">Tổng giá trị hàng hóa trong kho theo thời gian</p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Component Nhật ký hoạt động
  const AuditLog = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Nhật ký hoạt động</h2>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-4">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">{log.action}</h4>
                    <span className="text-xs text-gray-500">{log.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <p className="text-xs text-gray-500 mt-1">Thực hiện bởi: {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Component Quản lý người dùng
  const UserManagement = () => {
    const users = [
      { id: 1, name: 'Nguyễn Văn A', username: 'admin', role: 'admin', email: 'admin@example.com' },
      { id: 2, name: 'Trần Thị B', username: 'editor', role: 'editor', email: 'editor@example.com' },
      { id: 3, name: 'Lê Văn C', username: 'viewer', role: 'viewer', email: 'viewer@example.com' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>Thêm người dùng</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài khoản</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm">{user.username}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Quản trị' : user.role === 'editor' ? 'Biên tập' : 'Xem'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render component dựa theo tab
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductList />;
      case 'receipts': return <ReceiptList />;
      case 'issues': return <IssueList />;
      case 'reports': return <Reports />;
      case 'audit': return <AuditLog />;
      case 'users': return <UserManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden">
            <div className="bg-white w-64 h-full p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-4 p-2 hover:bg-gray-100 rounded"
              >
                <X />
              </button>
              {/* Mobile menu items - similar to Sidebar */}
            </div>
          </div>
        )}
        
        <main className="p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default WarehouseApp; className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Kho</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Tài khoản demo:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Editor:</strong> editor / editor123</p>
            <p><strong>Viewer:</strong> viewer / viewer123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Dashboard chính
const WarehouseApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dữ liệu mẫu
  const [products, setProducts] = useState([
    { id: 1, sku: 'SP001', name: 'Áo thun nam', unit: 'cái', price: 150000, quantity: 100, minStock: 20, image: '👕' },
    { id: 2, sku: 'SP002', name: 'Quần jean nữ', unit: 'cái', price: 350000, quantity: 50, minStock: 15, image: '👖' },
    { id: 3, sku: 'SP003', name: 'Giày thể thao', unit: 'đôi', price: 500000, quantity: 30, minStock: 10, image: '👟' },
    { id: 4, sku: 'SP004', name: 'Túi xách', unit: 'cái', price: 200000, quantity: 8, minStock: 10, image: '👜' },
  ]);

  const [receipts, setReceipts] = useState([
    { id: 1, code: 'PN001', date: '2025-01-10', user: 'Nguyễn Văn A', supplier: 'NCC A', status: 'completed', items: [{productId: 1, quantity: 50}] },
    { id: 2, code: 'PN002', date: '2025-01-15', user: 'Trần Thị B', supplier: 'NCC B', status: 'completed', items: [{productId: 2, quantity: 30}] },
  ]);

  const [issues, setIssues] = useState([
    { id: 1, code: 'PX001', date: '2025-01-20', user: 'Trần Thị B', reason: 'Bán lẻ', status: 'completed', items: [{productId: 1, quantity: 20}] },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, date: '2025-01-20 14:30', user: 'Trần Thị B', action: 'Xuất kho', details: 'Xuất 20 cái Áo thun nam - Phiếu PX001' },
    { id: 2, date: '2025-01-15 10:00', user: 'Trần Thị B', action: 'Nhập kho', details: 'Nhập 30 cái Quần jean nữ - Phiếu PN002' },
    { id: 3, date: '2025-01-10 09:00', user: 'Nguyễn Văn A', action: 'Nhập kho', details: 'Nhập 50 cái Áo thun nam - Phiếu PN001' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Túi xách sắp hết hàng (còn 8 cái)', time: '30 phút trước', read: false },
  ]);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const hasPermission = (action) => {
    const permissions = {
      admin: ['view', 'create', 'edit', 'delete', 'manage_users'],
      editor: ['view', 'create', 'edit'],
      viewer: ['view']
    };
    return permissions[currentUser.role]?.includes(action);
  };

  // Component Sidebar
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', icon: TrendingUp, label: 'Tổng quan', roles: ['admin', 'editor', 'viewer'] },
      { id: 'products', icon: Package, label: 'Hàng hóa', roles: ['admin', 'editor', 'viewer'] },
      { id: 'receipts', icon: ShoppingCart, label: 'Phiếu nhập', roles: ['admin', 'editor', 'viewer'] },
      { id: 'issues', icon: FileText, label: 'Phiếu xuất', roles: ['admin', 'editor', 'viewer'] },
      { id: 'reports', icon: FileText, label: 'Báo cáo', roles: ['admin', 'editor', 'viewer'] },
      { id: 'audit', icon: Clock, label: 'Nhật ký', roles: ['admin'] },
      { id: 'users', icon: Users, label: 'Người dùng', roles: ['admin'] },
    ];

    return (
      <div className="bg-gray-800 text-white w-64 min-h-screen p-4 hidden md:block">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8" />
            <h1 className="text-xl font-bold">Quản lý Kho</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map(item => {
            if (!item.roles.includes(currentUser.role)) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    );
  };

  // Component Header cho mobile
  const Header = () => (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
      <div className="flex items-center space-x-3">
        <Package className="w-6 h-6 text-blue-600" />
        <h1 className="text-lg font-bold">Quản lý Kho</h1>
      </div>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>
    </div>
  );

  // Component Dashboard
  const Dashboard = () => {
    const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Tổng sản phẩm</p>
                <p className="text-3xl font-bold mt-2">{products.length}</p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-green-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Giá trị kho</p>
                <p className="text-2xl font-bold mt-2">{(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-yellow-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Cảnh báo tồn kho</p>
                <p className="text-3xl font-bold mt-2">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-purple-500 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Phiếu hôm nay</p>
                <p className="text-3xl font-bold mt-2">3</p>
              </div>
              <FileText className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">Cảnh báo hàng sắp hết</h3>
                {lowStockProducts.map(p => (
                  <p key={p.id} className="text-yellow-700 text-sm">
                    • {p.name}: Còn {p.quantity} {p.unit} (Tối thiểu: {p.minStock})
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.details}</p>
                  <p className="text-xs text-gray-500">{log.user} - {log.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Component Danh sách sản phẩm
  const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ProductForm = ({ product, onSave, onCancel }) => {
      const [formData, setFormData] = useState(product || {
        sku: '', name: '', unit: 'cái', price: 0, quantity: 0, minStock: 0, image: '📦'
      });

      return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Mã SKU"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
            <input
              type="text"
              placeholder="Đơn vị"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
            <input
              type="number"
              placeholder="Đơn giá"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
            <input
              type="number"
              placeholder="Số lượng tối thiểu"
              value={formData.minStock}
              onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="px-4 py-2 border rounded-lg"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={!hasPermission('create') && !hasPermission('edit')}
            >
              Lưu
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Danh mục hàng hóa</h2>
          {hasPermission('create') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm sản phẩm</span>
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showForm && (
          <ProductForm
            onSave={(data) => {
              setProducts([...products, { ...data, id: Date.now() }]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSave={(data) => {
              setProducts(products.map(p => p.id === editingProduct.id ? { ...data, id: p.id } : p));
              setEditingProduct(null);
            }}
            onCancel={() => setEditingProduct(null)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{product.image}</div>
                {(hasPermission('edit') || hasPermission('delete')) && (
                  <div className="flex space-x-2">
                    {hasPermission('edit') && (
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {hasPermission('delete') && (
                      <button
                        onClick={() => {
                          if (confirm('Xóa sản phẩm này?')) {
                            setProducts(products.filter(p => p.id !== product.id));
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tồn kho:</span>
                  <span className={`font-bold ${product.quantity <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.quantity} {product.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Đơn giá:</span>
                  <span className="font-medium">{product.price.toLocaleString()}đ</span>
                </div>
                {product.quantity <= product.minStock && (
                  <div className="flex items-center space-x-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Sắp hết hàng</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component Phiếu nhập kho
  const ReceiptList = () => {
    const [showForm, setShowForm] = useState(false);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Phiếu nhập kho</h2>
          {hasPermission('create') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo phiếu nhập</span>
            </button>
          )}
        </div>

        {showForm && hasPermission('create') && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Tạo phiếu nhập mới</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nhà cung cấp"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>Chọn sản phẩm</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Số lượng"
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex space-x-3">
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Tạo phiếu
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phiếu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NCC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipts.map(receipt => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{receipt.code}</td>
                    <td className="px-6 py-4 text-sm">{receipt.date}</td>
                    <td className="px-6 py-4 text-sm">{receipt.supplier}</td>
                    <td className="px-6 py-4 text-sm">{receipt.user}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Component Phiếu xuất kho
  const IssueList = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Phiếu xuất kho</h2>
          {hasPermission('create') && (
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Plus className="w-5 h-5" />
              <span>Tạo phiếu xuất</span>
            </button>
          )}
        </div>

        <div