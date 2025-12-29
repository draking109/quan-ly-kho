import React, { useState, useEffect } from 'react';
import { 
  Package, Users, FileText, TrendingUp, AlertTriangle, 
  LogOut, Menu, X, Plus, Edit2, Trash2, Eye, Search,
  Download, Bell, Clock, User, ShoppingCart, CheckCircle,
  Save, XCircle, DollarSign, BarChart3, Calendar
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
        <div className="text-center mb-8">
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
    { id: 1, sku: 'SP001', name: 'Áo thun nam', unit: 'cái', price: 150000, quantity: 100, minStock: 20, image: '👕', description: 'Áo thun cotton cao cấp' },
    { id: 2, sku: 'SP002', name: 'Quần jean nữ', unit: 'cái', price: 350000, quantity: 50, minStock: 15, image: '👖', description: 'Quần jean co giãn' },
    { id: 3, sku: 'SP003', name: 'Giày thể thao', unit: 'đôi', price: 500000, quantity: 30, minStock: 10, image: '👟', description: 'Giày chạy bộ chuyên nghiệp' },
    { id: 4, sku: 'SP004', name: 'Túi xách', unit: 'cái', price: 200000, quantity: 8, minStock: 10, image: '👜', description: 'Túi xách da PU' },
    { id: 5, sku: 'SP005', name: 'Mũ lưỡi trai', unit: 'cái', price: 80000, quantity: 45, minStock: 15, image: '🧢', description: 'Mũ thể thao' },
  ]);

  const [receipts, setReceipts] = useState([
    { 
      id: 1, 
      code: 'PN001', 
      date: '2025-01-10 09:30', 
      user: 'Nguyễn Văn A', 
      supplier: 'Công ty TNHH ABC', 
      status: 'completed', 
      items: [
        {productId: 1, productName: 'Áo thun nam', quantity: 50, price: 120000}
      ],
      total: 6000000
    },
    { 
      id: 2, 
      code: 'PN002', 
      date: '2025-01-15 14:20', 
      user: 'Trần Thị B', 
      supplier: 'Nhà cung cấp XYZ', 
      status: 'completed', 
      items: [
        {productId: 2, productName: 'Quần jean nữ', quantity: 30, price: 300000}
      ],
      total: 9000000
    },
    { 
      id: 3, 
      code: 'PN003', 
      date: '2025-01-20 10:00', 
      user: 'Trần Thị B', 
      supplier: 'Công ty TNHH ABC', 
      status: 'draft', 
      items: [
        {productId: 5, productName: 'Mũ lưỡi trai', quantity: 20, price: 60000}
      ],
      total: 1200000
    },
  ]);

  const [issues, setIssues] = useState([
    { 
      id: 1, 
      code: 'PX001', 
      date: '2025-01-20 14:30', 
      user: 'Trần Thị B', 
      reason: 'Bán lẻ', 
      status: 'completed', 
      items: [
        {productId: 1, productName: 'Áo thun nam', quantity: 20, price: 150000}
      ],
      total: 3000000
    },
    { 
      id: 2, 
      code: 'PX002', 
      date: '2025-01-22 16:45', 
      user: 'Nguyễn Văn A', 
      reason: 'Bán sỉ', 
      status: 'completed', 
      items: [
        {productId: 2, productName: 'Quần jean nữ', quantity: 10, price: 350000},
        {productId: 3, productName: 'Giày thể thao', quantity: 5, price: 500000}
      ],
      total: 6000000
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, date: '2025-01-22 16:45', user: 'Nguyễn Văn A', action: 'Xuất kho', details: 'Xuất 10 cái Quần jean nữ, 5 đôi Giày thể thao - Phiếu PX002' },
    { id: 2, date: '2025-01-20 14:30', user: 'Trần Thị B', action: 'Xuất kho', details: 'Xuất 20 cái Áo thun nam - Phiếu PX001' },
    { id: 3, date: '2025-01-20 10:00', user: 'Trần Thị B', action: 'Nhập kho', details: 'Tạo phiếu nhập PN003 (Nháp)' },
    { id: 4, date: '2025-01-15 14:20', user: 'Trần Thị B', action: 'Nhập kho', details: 'Nhập 30 cái Quần jean nữ - Phiếu PN002' },
    { id: 5, date: '2025-01-10 09:30', user: 'Nguyễn Văn A', action: 'Nhập kho', details: 'Nhập 50 cái Áo thun nam - Phiếu PN001' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Túi xách sắp hết hàng (còn 8 cái)', time: '30 phút trước', read: false },
    { id: 2, type: 'info', message: 'Phiếu xuất PX002 đã được hoàn thành', time: '2 giờ trước', read: false },
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

  // Hàm xuất Excel
  const exportToExcel = (data, filename) => {
    let csv = '';
    
    if (filename.includes('products')) {
      csv = 'Mã SKU,Tên sản phẩm,Đơn vị,Đơn giá,Tồn kho,Tồn tối thiểu,Giá trị\n';
      data.forEach(item => {
        csv += `${item.sku},${item.name},${item.unit},${item.price},${item.quantity},${item.minStock},${item.quantity * item.price}\n`;
      });
    } else if (filename.includes('receipts')) {
      csv = 'Mã phiếu,Ngày,Nhà cung cấp,Người tạo,Tổng tiền,Trạng thái\n';
      data.forEach(item => {
        csv += `${item.code},${item.date},${item.supplier},${item.user},${item.total},${item.status === 'completed' ? 'Hoàn thành' : 'Nháp'}\n`;
      });
    } else if (filename.includes('issues')) {
      csv = 'Mã phiếu,Ngày,Lý do,Người tạo,Tổng tiền,Trạng thái\n';
      data.forEach(item => {
        csv += `${item.code},${item.date},${item.reason},${item.user},${item.total},${item.status === 'completed' ? 'Hoàn thành' : 'Nháp'}\n`;
      });
    }
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Component Sidebar
  const Sidebar = () => {
    const menuItems = [
      { id: 'dashboard', icon: TrendingUp, label: 'Tổng quan', roles: ['admin', 'editor', 'viewer'] },
      { id: 'products', icon: Package, label: 'Hàng hóa', roles: ['admin', 'editor', 'viewer'] },
      { id: 'receipts', icon: ShoppingCart, label: 'Phiếu nhập', roles: ['admin', 'editor', 'viewer'] },
      { id: 'issues', icon: FileText, label: 'Phiếu xuất', roles: ['admin', 'editor', 'viewer'] },
      { id: 'reports', icon: BarChart3, label: 'Báo cáo', roles: ['admin', 'editor', 'viewer'] },
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
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
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
              <DollarSign className="w-12 h-12 opacity-80" />
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
              <div className="flex-1">
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
    const [viewingProduct, setViewingProduct] = useState(null);

    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ProductForm = ({ product, onSave, onCancel }) => {
      const [formData, setFormData] = useState(product || {
        sku: '', name: '', unit: 'cái', price: 0, quantity: 0, minStock: 0, image: '📦', description: ''
      });

      const handleSave = () => {
        if (!formData.sku || !formData.name) {
          alert('Vui lòng nhập đầy đủ thông tin!');
          return;
        }
        onSave(formData);
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã SKU *</label>
                <input
                  type="text"
                  placeholder="VD: SP001"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  placeholder="VD: Áo thun nam"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn vị</label>
                <input
                  type="text"
                  placeholder="VD: cái, kg, thùng"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng tối thiểu</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  placeholder="📦"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  placeholder="Mô tả chi tiết sản phẩm..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </button>
              <button
                onClick={onCancel}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <XCircle className="w-4 h-4" />
                <span>Hủy</span>
              </button>
            </div>
          </div>
        </div>
      );
    };

    const ProductDetailModal = ({ product, onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Chi tiết sản phẩm</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl mb-2">{product.image}</div>
              <h4 className="text-2xl font-bold">{product.name}</h4>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm text-gray-600">Đơn vị</p>
                <p className="font-semibold">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Đơn giá</p>
                <p className="font-semibold text-green-600">{product.price.toLocaleString()} đ</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tồn kho hiện tại</p>
                <p className={`font-semibold text-lg ${product.quantity <= product.minStock ? 'text-red-600' : 'text-blue-600'}`}>
                  {product.quantity} {product.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tồn tối thiểu</p>
                <p className="font-semibold">{product.minStock} {product.unit}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Giá trị tồn kho</p>
                <p className="font-semibold text-lg text-purple-600">
                  {(product.quantity * product.price).toLocaleString()} đ
                </p>
              </div>
            </div>
            {product.description && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                <p className="text-gray-800">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Danh mục hàng hóa</h2>
          <div className="flex space-x-2">
            <button