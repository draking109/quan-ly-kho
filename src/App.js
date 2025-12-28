import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, AlertTriangle, LogOut, Trash2, Search,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Printer, Edit2, X, Eye, FileSpreadsheet, DollarSign
} from 'lucide-react';

// 1. NHẬP THƯ VIỆN KẾT NỐI
import { createClient } from '@supabase/supabase-js';

/* ================== CẤU HÌNH KẾT NỐI SUPABASE ================== */
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);

// ID này dùng để định danh kho của bạn trên hệ thống chung
const STORE_ID = "kho_chinh_pro_001"; 

/* ================== DỮ LIỆU BAN ĐẦU ================== */
const initialData = {
  users: [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên' },
    { id: 2, username: 'nv', password: '123', role: 'editor', name: 'Nhân viên kho' }
  ],
  products: [
    { id: 1, sku: 'AO-001', name: 'Áo Thun Polo', unit: 'Cái', price: 150000, minStock: 10, currentStock: 25, isActive: true },
    { id: 2, sku: 'QN-002', name: 'Quần Jean Nam', unit: 'Cái', price: 350000, minStock: 5, currentStock: 4, isActive: true }
  ],
  receipts: [],
  issues: [],
  logs: []
};

/* ================== HÀM HỖ TRỢ XUẤT EXCEL (CSV) ================== */
const exportToExcel = (filename, headers, rows) => {
  let csvContent = "\uFEFF";
  csvContent += headers.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toLocaleDateString('vi-VN')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // 2. TỰ ĐỘNG LẤY DỮ LIỆU TỪ CLOUD
  useEffect(() => {
    const loadCloudData = async () => {
      try {
        let { data: cloudEntry, error } = await supabase
          .from('warehouse_data')
          .select('content')
          .eq('store_id', STORE_ID)
          .maybeSingle();

        if (cloudEntry) {
          setData(cloudEntry.content);
        } else {
          // Nếu database trống, tạo bản ghi đầu tiên
          await supabase.from('warehouse_data').insert({ store_id: STORE_ID, content: initialData });
        }
      } catch (err) {
        console.error("Lỗi kết nối database:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCloudData();
  }, []);

  // 3. TỰ ĐỘNG LƯU LÊN CLOUD KHI DỮ LIỆU THAY ĐỔI
  useEffect(() => {
    if (loading) return; 

    const saveToCloud = async () => {
      await supabase
        .from('warehouse_data')
        .upsert({ store_id: STORE_ID, content: data });
    };
    
    const timeoutId = setTimeout(saveToCloud, 500);
    return () => clearTimeout(timeoutId);
  }, [data, loading]);

  const addLog = (action) => {
    setData(prev => ({
      ...prev,
      logs: [{
        id: Date.now(),
        date: new Date().toLocaleString('vi-VN'),
        user: currentUser?.name || 'Hệ thống',
        action
      }, ...prev.logs]
    }));
  };

  const handleLogin = e => {
    e.preventDefault();
    const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password);
    if (!u) return alert('Sai tài khoản hoặc mật khẩu');
    setCurrentUser(u);
    addLog('Đăng nhập hệ thống');
  };

  const handleLogout = () => {
    addLog('Đăng xuất hệ thống');
    setCurrentUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-600 font-medium">Đang kết nối kho dữ liệu online...</p>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4 border">
          <div className="text-center mb-6">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">Warehouse Pro</h1>
            <p className="text-slate-400 text-sm">Hệ thống quản lý kho Online</p>
          </div>
          <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên đăng nhập"
            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mật khẩu"
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-700 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col shadow-2xl no-print">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <Package className="text-blue-400" />
          <span className="font-bold text-white text-lg tracking-tight uppercase">W-Manager</span>
        </div>
        <nav className="space-y-1 flex-1">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />
          {currentUser.role !== 'viewer' && (
            <>
              <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
              <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
            </>
          )}
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />
        </nav>
        <div className="pt-4 border-t border-slate-800">
          <div className="px-3 mb-4 text-sm text-white font-medium">{currentUser.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 p-2 w-full text-sm font-medium transition-colors">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} addLog={addLog} currentUser={currentUser} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} addLog={addLog} currentUser={currentUser} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} addLog={addLog} currentUser={currentUser} />}
        {activeTab === 'history' && <HistoryTable data={data} />}
      </main>
    </div>
  );
}

// CÁC COMPONENT PHỤ (Giữ nguyên logic của bạn)
const NavBtn = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
    <Icon size={18} /> {label}
  </button>
);

const Dashboard = ({ data }) => {
  const activeProducts = useMemo(() => data.products.filter(p => p.isActive), [data.products]);
  const low = useMemo(() => activeProducts.filter(p => p.currentStock <= p.minStock), [activeProducts]);
  const totalValue = useMemo(() => activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0), [activeProducts]);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">Mặt hàng kinh doanh</p>
          <h3 className="text-3xl font-bold">{activeProducts.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><DollarSign size={14}/> Giá trị tồn kho</p>
          <h3 className="text-3xl font-bold text-green-600">{totalValue.toLocaleString()}đ</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1">Cảnh báo sắp hết</p>
          <h3 className="text-3xl font-bold text-red-500">{low.length}</h3>
        </div>
      </div>
      {low.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
          <h3 className="text-red-800 font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Cần nhập thêm</h3>
          <div className="space-y-2">
            {low.map(p => (
              <div key={p.id} className="bg-white p-3 rounded border border-red-200 flex justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="font-bold text-red-600">Còn {p.currentStock} {p.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Products = ({ data, setData, currentUser, addLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ sku: '', name: '', unit: 'Cái', price: 0, minStock: 5 });
  const products = useMemo(() => data.products.filter(p => p.isActive && p.name.toLowerCase().includes(searchTerm.toLowerCase())), [data.products, searchTerm]);

  const handleSave = (e) => {
    e.preventDefault();
    const product = {
      ...formData,
      id: editingProduct?.id || Date.now(),
      isActive: true,
      currentStock: editingProduct?.currentStock || 0
    };
    if (editingProduct) {
      setData(prev => ({ ...prev, products: prev.products.map(p => p.id === product.id ? product : p) }));
      addLog(`Cập nhật ${product.name}`);
    } else {
      setData(prev => ({ ...prev, products: [...prev.products, product] }));
      addLog(`Thêm mới ${product.name}`);
    }
    setShowForm(false);
  };

  const handleDelete = (p) => {
    if (!window.confirm(`Xóa ${p.name}?`)) return;
    setData(prev => ({ ...prev, products: prev.products.map(x => x.id === p.id ? {...x, isActive: false} : x) }));
    addLog(`Xóa ${p.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh mục hàng hóa</h2>
        <button onClick={() => { setShowForm(true); setEditingProduct(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Thêm hàng
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Tên</th>
              <th className="px-6 py-4 text-center">Tồn kho</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td>
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditingProduct(p); setFormData(p); setShowForm(true); }} className="text-blue-500 mr-3"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(p)} className="text-red-400"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">{editingProduct ? 'Sửa hàng' : 'Thêm hàng'}</h3>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" placeholder="Tên hàng" required />
            <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border p-2 rounded" placeholder="Mã SKU" required />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="border p-2 rounded" placeholder="Giá vốn" />
              <input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="border p-2 rounded" placeholder="Đơn vị" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded">Hủy</button>
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const Transaction = ({ type, data, setData, addLog, currentUser }) => {
  const [cart, setCart] = useState([]);
  const products = data.products.filter(p => p.isActive);

  const save = () => {
    if (!cart.length) return;
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const i = cart.find(x => x.id === p.id);
        return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p;
      }),
      [type === 'in' ? 'receipts' : 'issues']: [{
        id: Date.now(),
        code: `${type === 'in' ? 'PN' : 'PX'}-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleString('vi-VN'),
        user: currentUser.name,
        items: [...cart]
      }, ...prev[type === 'in' ? 'receipts' : 'issues']]
    }));
    addLog(`Phiếu ${type === 'in' ? 'nhập' : 'xuất'} kho`);
    setCart([]);
    alert("Thành công!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{type === 'in' ? 'Nhập kho' : 'Xuất kho'}</h2>
        <div className="bg-white border rounded-xl h-96 overflow-y-auto">
          {products.map(p => (
            <button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 border-b hover:bg-slate-50 flex justify-between">
              <span>{p.name} (Tồn: {p.currentStock})</span>
              <Plus size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border flex flex-col">
        <h3 className="font-bold mb-4">Danh sách chờ ({cart.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded">
              <span>{i.name}</span>
              <input type="number" value={i.qty} onChange={e => {
                const newCart = [...cart];
                newCart[idx].qty = Number(e.target.value);
                setCart(newCart);
              }} className="w-16 border rounded text-center" />
            </div>
          ))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg font-bold">XÁC NHẬN</button>
      </div>
    </div>
  );
};

const HistoryTable = ({ data }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lịch sử phiếu</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-bold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Mã</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Ngày</th>
              <th className="px-6 py-4">Người lập</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {all.map(d => (
              <tr key={d.id}>
                <td className="px-6 py-4 font-bold text-blue-600">{d.code}</td>
                <td className="px-6 py-4">{d.type}</td>
                <td className="px-6 py-4 text-slate-500">{d.date}</td>
                <td className="px-6 py-4">{d.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};