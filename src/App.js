import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, Download
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans text-slate-500 italic">Đang tải dữ liệu từ Cloud...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4 border border-slate-200">
          <div className="text-center mb-6">
            <div className="bg-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
               <Package className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Warehouse Pro</h1>
            <p className="text-slate-400 text-xs mt-1 uppercase font-bold">Hệ thống quản trị kho v1.2</p>
          </div>
          <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]">ĐĂNG NHẬP</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-10 flex items-center gap-2 px-2 text-xl tracking-tighter italic">
          <ShieldCheck className="text-blue-500" size={24}/> W-MANAGER
        </div>
        <nav className="space-y-1.5 flex-1 text-sm font-medium">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Danh mục hàng hóa" />
          {currentUser.role !== 'viewer' && (
            <>
              <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Giao dịch</div>
              <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
              <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
            </>
          )}
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />
          {currentUser.role === 'admin' && (
            <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Quản lý tài khoản" />
          )}
        </nav>
        <div className="pt-4 border-t border-slate-800/50">
           <div className="px-3 mb-4">
             <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">Đang đăng nhập</div>
             <div className="font-bold text-white truncate text-sm">{currentUser.name}</div>
           </div>
           <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-xs font-bold w-full hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={16}/> ĐĂNG XUẤT</button>
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
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
    <Icon size={18} strokeWidth={active ? 2.5 : 2} /> {label}
  </button>
);

/* ================== COMPONENT: DASHBOARD ================== */
const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  const totalItems = activeProducts.reduce((sum, p) => sum + p.currentStock, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">TỔNG QUAN KHO HÀNG</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={28}/></div>
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng số mặt hàng</p><h3 className="text-3xl font-black text-slate-800">{activeProducts.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 border-b-4 border-b-emerald-500">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={28}/></div>
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng giá trị tồn kho</p><h3 className="text-3xl font-black text-emerald-600">{totalValue.toLocaleString()}đ</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><History size={28}/></div>
          <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng số lượng tồn</p><h3 className="text-3xl font-black text-slate-800">{totalItems.toLocaleString()}</h3></div>
        </div>
      </div>
    </div>
  );
};

/* ================== COMPONENT: PRODUCTS (Tách cột STT, Mã, Tên, ĐVT, Đơn giá, Thành tiền) ================== */
const Products = ({ data, setData, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Cái', price: 0 });

  const filteredList = useMemo(() => {
    return data.products.filter(p => 
      p.isActive && (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data.products, searchTerm]);

  const save = (e) => {
    e.preventDefault();
    if (!editP && data.products.find(p => p.sku === form.sku && p.isActive)) return alert("Mã SKU này đã tồn tại!");
    const product = { ...form, id: editP?.id || Date.now(), isActive: true, currentStock: editP?.currentStock || 0 };
    if (editP) setData(prev => ({ ...prev, products: prev.products.map(p => p.id === product.id ? product : p) }));
    else setData(prev => ({ ...prev, products: [...prev.products, product] }));
    setShowForm(false);
    addLog(`${editP ? 'Sửa' : 'Thêm'} mặt hàng: ${form.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Danh mục hàng hóa</h2>
        <button onClick={() => { setShowForm(true); setEditP(null); setForm({sku:'', name:'', unit:'Cái', price:0}) }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm">
          <Plus size={18} /> THÊM MẶT HÀNG
        </button>
      </div>

      <div className="relative bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <Search className="absolute left-5 top-5 text-slate-400" size={20} />
        <input className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Tìm kiếm nhanh theo tên hoặc mã sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[11px] tracking-widest">
            <tr>
              <th className="px-6 py-4 text-center border-r border-slate-800 w-16">STT</th>
              <th className="px-6 py-4 border-r border-slate-800">Mã</th>
              <th className="px-6 py-4 border-r border-slate-800">Tên mặt hàng</th>
              <th className="px-6 py-4 text-center border-r border-slate-800">ĐVT</th>
              <th className="px-6 py-4 text-right border-r border-slate-800">Đơn giá</th>
              <th className="px-6 py-4 text-center border-r border-slate-800">Số lượng</th>
              <th className="px-6 py-4 text-right border-r border-slate-800">Thành tiền</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.map((p, index) => (
              <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-4 text-center font-bold text-slate-400 border-r border-slate-50">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-blue-600 font-bold border-r border-slate-50">{p.sku}</td>
                <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-50">{p.name}</td>
                <td className="px-6 py-4 text-center text-slate-500 font-medium border-r border-slate-50">{p.unit}</td>
                <td className="px-6 py-4 text-right font-medium border-r border-slate-50">{p.price.toLocaleString()}đ</td>
                <td className="px-6 py-4 text-center border-r border-slate-50">
                   <span className={`px-3 py-1 rounded-lg font-black ${p.currentStock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-500'}`}>{p.currentStock}</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-emerald-600 border-r border-slate-50">
                  {(p.currentStock * p.price).toLocaleString()}đ
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => { setEditP(p); setForm(p); setShowForm(true); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => { if(window.confirm('Xóa mặt hàng này?')) setData(prev=>({...prev, products: prev.products.map(x=>x.id===p.id?{...x,isActive:false}:x)})) }} className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-5 shadow-2xl border border-white">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight border-b pb-4">{editP ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới'}</h3>
            <div className="space-y-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tên mặt hàng</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="Nhập tên..." required /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mã mặt hàng (SKU)</label><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold" placeholder="MA-001" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Giá vốn / Đơn giá</label><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Đơn vị tính (ĐVT)</label><input value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold" placeholder="Cái/Kg..." /></div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 uppercase text-xs">Hủy</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase text-xs">Lưu dữ liệu</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* ================== COMPONENT: TRANSACTION (Logic nhập/xuất) ================== */
const Transaction = ({ type, data, setData, addLog, currentUser }) => {
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const products = data.products.filter(p => p.isActive);

  const save = () => {
    if (!cart.length || isSaving) return;
    if (type === 'out') {
      for (const item of cart) {
        const origin = data.products.find(p => p.id === item.id);
        if (item.qty > origin.currentStock) return alert(`Lỗi: ${item.name} không đủ tồn kho!`);
      }
    }
    setIsSaving(true);
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const i = cart.find(x => x.id === p.id);
        return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p;
      }),
      [type === 'in' ? 'receipts' : 'issues']: [{ id: Date.now(), code: `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`, date: new Date().toLocaleString('vi-VN'), user: currentUser.name, items: [...cart] }, ...prev[type === 'in' ? 'receipts' : 'issues']]
    }));
    addLog(`Lập phiếu ${type==='in'?'nhập':'xuất'}`);
    setCart([]); setIsSaving(false); alert("Thành công!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">{type==='in'?'Nhập kho hàng':'Xuất kho hàng'}</h2>
        <div className="bg-white border border-slate-200 rounded-2xl h-[550px] overflow-y-auto shadow-sm divide-y">
          {products.map(p => (
            <button key={p.id} onClick={() => {
              const ex = cart.find(x => x.id === p.id);
              if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
              else setCart([...cart, {...p, qty: 1}]);
            }} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center transition-all group">
              <div><span className="font-bold text-slate-800 block">{p.name}</span><span className="text-[10px] font-bold text-slate-400 uppercase">Mã: {p.sku} | Tồn: {p.currentStock} {p.unit}</span></div>
              <Plus size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 p-6 rounded-3xl flex flex-col shadow-2xl sticky top-8 h-fit max-h-[85vh] text-white">
        <h3 className="font-black text-lg uppercase tracking-widest mb-6 text-blue-400 border-b border-slate-800 pb-4 flex items-center gap-2">
           <List size={20}/> Chi tiết phiếu
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[250px] pr-2 custom-scrollbar">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex-1">
                <span className="font-bold text-sm block">{i.name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter italic">Đơn giá: {i.price.toLocaleString()}đ</span>
              </div>
              <div className="flex items-center gap-4">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center font-black text-blue-400" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
           <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="flex justify-between font-black text-xl mb-6"><span>TỔNG CỘNG:</span><span className="text-blue-400">{cart.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}đ</span></div>
              <button disabled={isSaving} onClick={save} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest text-sm">XÁC NHẬN PHIẾU</button>
           </div>
        )}
      </div>
    </div>
  );
};

/* ================== COMPONENT: HISTORY ================== */
const HistoryTable = ({ data }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[10px] tracking-widest">
            <tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày giờ</th><th className="px-6 py-4">Người lập</th><th className="px-6 py-4">Chi tiết</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {all.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-black text-blue-600 font-mono tracking-tighter">{d.code}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span></td>
                <td className="px-6 py-4 text-slate-400 font-medium">{d.date}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{d.user}</td>
                <td className="px-6 py-4 text-[11px] text-slate-500">{d.items.map(i => `${i.name} (${i.qty})`).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================== COMPONENT: USERS ================== */
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
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase tracking-tight">Quản lý nhân sự</h2><button onClick={() => { setShowModal(true); setEditUser(null); setForm({username:'', password:'', name:'', role:'editor'}) }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700"><Plus size={18} /> THÊM MỚI</button></div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-[10px] tracking-widest"><tr><th className="px-6 py-4">Họ và tên</th><th className="px-6 py-4">Tên đăng nhập</th><th className="px-6 py-4">Phân quyền</th><th className="px-6 py-4 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-800">{u.name}</td><td className="px-6 py-4 text-blue-600 font-mono font-bold italic">{u.username}</td><td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditUser(u); setForm(u); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => { if(u.username!=='admin' && window.confirm('Xóa nhân viên?')) setData(prev=>({...prev, users: prev.users.filter(x=>x.id!==u.id)})) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editUser ? 'Cập nhật nhân viên' : 'Đăng ký nhân viên'}</h3>
            <div className="space-y-4">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Tên đầy đủ" required />
              <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-mono" placeholder="Username" required />
              <input type="text" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Mật khẩu" required />
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold"><option value="editor">Nhân viên kho</option><option value="admin">Quản trị viên</option></select>
            </div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-3 border rounded-xl font-bold uppercase text-xs">Hủy</button><button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 uppercase text-xs">Xác nhận</button></div>
          </form>
        </div>
      )}
    </div>
  );
};