import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, AlertTriangle, LogOut, Trash2, Search,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, Download, Filter
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/* ================== CẤU HÌNH KẾT NỐI ================== */
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);
const STORE_ID = "kho_chinh_pro_001"; 

const initialData = {
  users: [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên' },
    { id: 2, username: 'nv', password: '123', role: 'editor', name: 'Nhân viên kho' }
  ],
  products: [],
  receipts: [],
  issues: [],
  logs: []
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    const loadCloudData = async () => {
      try {
        let { data: cloudEntry } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
        if (cloudEntry) setData(cloudEntry.content);
        else await supabase.from('warehouse_data').insert({ store_id: STORE_ID, content: initialData });
      } finally { setLoading(false); }
    };
    loadCloudData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const save = async () => { await supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data }); };
      const t = setTimeout(save, 500);
      return () => clearTimeout(t);
    }
  }, [data, loading]);

  const addLog = (action) => {
    setData(prev => ({
      ...prev,
      logs: [{ id: Date.now(), date: new Date().toLocaleString('vi-VN'), user: currentUser?.name || 'Hệ thống', action }, ...prev.logs]
    }));
  };

  const handleLogin = e => {
    e.preventDefault();
    const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password);
    if (!u) return alert('Sai tài khoản hoặc mật khẩu');
    setCurrentUser(u);
    addLog('Đăng nhập hệ thống');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans text-slate-500">Đang kết nối Cloud...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Package className="text-blue-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center">Warehouse Pro</h1>
            <p className="text-slate-500 text-sm">Hệ thống quản lý kho thông minh</p>
          </div>
          <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col no-print">
        <div className="font-bold text-white mb-8 flex items-center gap-2 px-2 text-lg">
          <ShieldCheck className="text-blue-400" size={24}/> W-MANAGER
        </div>
        <nav className="space-y-1 flex-1 text-sm">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />
          {currentUser.role !== 'viewer' && (
            <>
              <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
              <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
            </>
          )}
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />
          {currentUser.role === 'admin' && (
            <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Quản lý tài khoản" />
          )}
        </nav>
        <div className="pt-4 border-t border-slate-800">
           <div className="text-white text-xs mb-2 px-2 uppercase opacity-50 tracking-wider font-semibold">Người dùng</div>
           <div className="px-2 font-bold text-white mb-4 truncate">{currentUser.name}</div>
           <button onClick={() => setCurrentUser(null)} className="text-red-400 p-2 flex items-center gap-2 text-sm font-medium w-full hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={16}/> Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} addLog={addLog} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} addLog={addLog} currentUser={currentUser} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} addLog={addLog} currentUser={currentUser} />}
        {activeTab === 'history' && <HistoryTable data={data} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} addLog={addLog} />}
      </main>
    </div>
  );
}

const NavBtn = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
    <Icon size={18} /> {label}
  </button>
);

/* ================== COMPONENT: DASHBOARD ================== */
const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const lowStock = activeProducts.filter(p => p.currentStock <= p.minStock);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24}/></div>
          <div><p className="text-slate-500 text-sm">Mặt hàng</p><h3 className="text-2xl font-bold">{activeProducts.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-green-500 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24}/></div>
          <div><p className="text-slate-500 text-sm font-medium">Giá trị tồn kho</p><h3 className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()}đ</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-red-500 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24}/></div>
          <div><p className="text-slate-500 text-sm font-medium">Cảnh báo M1 (Zero Line)</p><h3 className="text-2xl font-bold text-red-500">{lowStock.length}</h3></div>
        </div>
      </div>
      
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <h4 className="text-red-700 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Danh sách hàng cần nhập ngay (Chạm mốc Zero Line)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-red-100 text-sm">
                <p className="font-bold">{p.name}</p>
                <p className="text-red-500 font-mono">Tồn: {p.currentStock} / Min: {p.minStock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== COMPONENT: PRODUCTS (UX & Logic nâng cấp) ================== */
const Products = ({ data, setData, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Cái', price: 0, minStock: 5 });

  const filteredList = useMemo(() => {
    return data.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterLowStock ? p.currentStock <= p.minStock : true;
      return p.isActive && matchSearch && matchFilter;
    });
  }, [data.products, searchTerm, filterLowStock]);

  const save = (e) => {
    e.preventDefault();
    // Chống trùng SKU (Chỉ check khi thêm mới)
    if (!editP && data.products.find(p => p.sku === form.sku && p.isActive)) {
      return alert("Mã SKU này đã tồn tại!");
    }

    const product = { ...form, id: editP?.id || Date.now(), isActive: true, currentStock: editP?.currentStock || 0 };
    if (editP) setData(prev => ({ ...prev, products: prev.products.map(p => p.id === product.id ? product : p) }));
    else setData(prev => ({ ...prev, products: [...prev.products, product] }));
    
    setShowForm(false);
    addLog(`${editP ? 'Cập nhật' : 'Thêm mới'} hàng: ${form.name}`);
  };

  const exportCSV = () => {
    const headers = "SKU,Ten Hang,Ton Kho,Don Vi,Gia Von\n";
    const rows = filteredList.map(p => `${p.sku},${p.name},${p.currentStock},${p.unit},${p.price}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ton_kho_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Danh mục hàng hóa</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-white border text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50"><Download size={18} /> Xuất file</button>
          <button onClick={() => { setShowForm(true); setEditP(null); setForm({sku:'', name:'', unit:'Cái', price:0, minStock:5}) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"><Plus size={18} /> Thêm hàng mới</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tìm theo tên hoặc mã SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setFilterLowStock(!filterLowStock)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${filterLowStock ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
          <Filter size={18} /> {filterLowStock ? 'Hiển thị tất cả' : 'Lọc hàng sắp hết (M1)'}
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase">
            <tr><th className="px-6 py-4">SKU</th><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">Mức Zero (M1)</th><th className="px-6 py-4 text-center">Tồn kho hiện tại</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y">
            {filteredList.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600 font-medium">{p.sku}</td>
                <td className="px-6 py-4">
                   <div className="font-bold text-slate-800">{p.name}</div>
                   <div className="text-xs text-slate-400">{p.price.toLocaleString()}đ / {p.unit}</div>
                </td>
                <td className="px-6 py-4 text-center text-slate-500 font-medium">{p.minStock}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full font-bold ${p.currentStock <= p.minStock ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                    {p.currentStock} {p.unit}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditP(p); setForm(p); setShowForm(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-1"><Edit2 size={16}/></button>
                  <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa mặt hàng này?')) setData(prev=>({...prev, products: prev.products.map(x=>x.id===p.id?{...x,isActive:false}:x)})) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={save} className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800">{editP ? 'Cập nhật thông tin' : 'Thêm hàng hóa mới'}</h3>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Tên hàng</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2.5 rounded-lg mt-1" placeholder="Ví dụ: Thép cuộn M1" required /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Mã SKU</label><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-2.5 rounded-lg mt-1 font-mono" placeholder="MA-001" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Giá vốn</label><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-2.5 rounded-lg mt-1" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Đơn vị</label><input value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full border p-2.5 rounded-lg mt-1" placeholder="Cái, Kg, Mét..." /></div>
              </div>
              <div><label className="text-xs font-bold text-red-500 uppercase">Mức tồn tối thiểu (Zero Line)</label><input type="number" value={form.minStock} onChange={e=>setForm({...form, minStock:Number(e.target.value)})} className="w-full border border-red-200 p-2.5 rounded-lg mt-1" /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 border rounded-lg font-medium hover:bg-slate-50 transition-colors">Hủy</button>
              <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Lưu dữ liệu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* ================== COMPONENT: TRANSACTION (Logic chặn xuất quá tồn) ================== */
const Transaction = ({ type, data, setData, addLog, currentUser }) => {
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const products = data.products.filter(p => p.isActive);

  const save = () => {
    if (!cart.length || isSaving) return;

    // KIỂM TRA LOGIC: Nếu xuất kho, không được xuất quá tồn thực tế
    if (type === 'out') {
      for (const item of cart) {
        const originProduct = data.products.find(p => p.id === item.id);
        if (item.qty > originProduct.currentStock) {
          alert(`LỖI: Mặt hàng [${item.name}] chỉ còn ${originProduct.currentStock} sản phẩm. Không thể xuất ${item.qty}!`);
          return;
        }
      }
    }

    setIsSaving(true);
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const i = cart.find(x => x.id === p.id);
        return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p;
      }),
      [type === 'in' ? 'receipts' : 'issues']: [{ 
        id: Date.now(), 
        code: `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`, 
        date: new Date().toLocaleString('vi-VN'), 
        user: currentUser.name, 
        items: [...cart] 
      }, ...prev[type === 'in' ? 'receipts' : 'issues']]
    }));
    
    addLog(`Lập phiếu ${type==='in'?'nhập':'xuất'} kho`);
    setCart([]);
    setIsSaving(false);
    alert("Xác nhận phiếu thành công!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{type==='in'?'Nhập hàng vào kho':'Xuất hàng khỏi kho'}</h2>
        <div className="bg-white border rounded-xl h-[600px] overflow-y-auto shadow-sm">
          {products.map(p => (
            <button key={p.id} onClick={() => {
              const exist = cart.find(x => x.id === p.id);
              if (exist) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
              else setCart([...cart, {...p, qty: 1}]);
            }} className="w-full text-left p-4 border-b hover:bg-blue-50/50 flex justify-between items-center group transition-colors">
              <div>
                <span className="font-bold text-slate-800 block">{p.name}</span>
                <span className={`text-xs font-bold ${p.currentStock <= p.minStock ? 'text-red-500' : 'text-slate-400'}`}>Mã: {p.sku} | Tồn: {p.currentStock}</span>
              </div>
              <Plus size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border flex flex-col shadow-lg sticky top-8 h-fit max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-bold text-lg">Chi tiết phiếu {type==='in'?'Nhập':'Xuất'}</h3>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">#{Date.now().toString().slice(-4)}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
          {cart.length === 0 && <div className="text-center py-10 text-slate-400">Chưa có sản phẩm nào được chọn</div>}
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-800">{i.name}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Đơn giá: {i.price.toLocaleString()}đ</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min="1" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-16 border rounded-lg p-1.5 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
           <div className="mt-6 border-t pt-4 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng giá trị:</span>
                <span className="text-blue-600">{cart.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}đ</span>
              </div>
              <button disabled={isSaving} onClick={save} className={`w-full ${isSaving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm`}>
                {isSaving ? 'Đang xử lý...' : 'Xác nhận hoàn tất phiếu'}
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

/* ================== COMPONENT: HISTORY (Bảng lịch sử) ================== */
const HistoryTable = ({ data }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lịch sử xuất nhập kho</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-500"><tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày thực hiện</th><th className="px-6 py-4">Người lập</th><th className="px-6 py-4">Sản phẩm</th></tr></thead>
          <tbody className="divide-y">
            {all.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-blue-600">{d.code}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${d.type === 'Nhập' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{d.date}</td>
                <td className="px-6 py-4 font-medium">{d.user}</td>
                <td className="px-6 py-4 text-xs text-slate-400">{d.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================== COMPONENT: USER MANAGEMENT ================== */
const UserManagement = ({ data, setData, addLog }) => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });
  const handleSave = (e) => {
    e.preventDefault();
    if (editUser) setData(prev => ({ ...prev, users: prev.users.map(u => u.id === editUser.id ? { ...form, id: u.id } : u) }));
    else setData(prev => ({ ...prev, users: [...prev.users, { ...form, id: Date.now() }] }));
    setShowModal(false);
    addLog(`${editUser?'Sửa':'Tạo'} tài khoản: ${form.username}`);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Quản lý nhân sự</h2><button onClick={() => { setShowModal(true); setEditUser(null); setForm({username:'', password:'', name:'', role:'editor'}) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-blue-700"><Plus size={18} /> Thêm nhân viên</button></div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-500"><tr><th className="px-6 py-4">Họ và tên</th><th className="px-6 py-4">Username</th><th className="px-6 py-4">Quyền hạn</th><th className="px-6 py-4 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td><td className="px-6 py-4 text-blue-600 font-mono">{u.username}</td><td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditUser(u); setForm(u); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => { if(u.username!=='admin' && window.confirm('Xóa nhân viên này?')) setData(prev=>({...prev, users: prev.users.filter(x=>x.id!==u.id)})) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold">{editUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2.5 rounded-lg" placeholder="Họ tên nhân viên" required />
              <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-2.5 rounded-lg font-mono" placeholder="Username đăng nhập" required />
              <input type="text" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-2.5 rounded-lg" placeholder="Mật khẩu" required />
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-2.5 rounded-lg"><option value="editor">Nhân viên kho (Editor)</option><option value="admin">Quản trị viên (Admin)</option></select>
            </div>
            <div className="flex gap-2 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2.5 border rounded-lg font-medium">Hủy</button><button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Xác nhận lưu</button></div>
          </form>
        </div>
      )}
    </div>
  );
};