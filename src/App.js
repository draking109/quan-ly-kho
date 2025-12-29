import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, AlertTriangle, LogOut, Trash2, Search,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, Key, DollarSign
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang kết nối Cloud...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <Package className="mx-auto text-blue-600 mb-2" size={40} />
            <h1 className="text-2xl font-bold font-sans text-slate-800">Warehouse Pro</h1>
          </div>
          <input className="w-full border p-3 rounded-lg" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-lg" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col no-print">
        <div className="font-bold text-white mb-8 flex items-center gap-2"><ShieldCheck className="text-blue-400"/> W-MANAGER</div>
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
           <div className="text-white text-xs mb-2 px-2 uppercase opacity-50">Người dùng</div>
           <div className="px-2 font-bold text-white mb-4 truncate">{currentUser.name}</div>
           <button onClick={() => setCurrentUser(null)} className="text-red-400 p-2 flex items-center gap-2 text-sm font-medium w-full hover:bg-red-500/10 rounded-lg"><LogOut size={16}/> Đăng xuất</button>
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
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
    <Icon size={18} /> {label}
  </button>
);

/* ================== CÁC COMPONENT CHỨC NĂNG ================== */

const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const low = activeProducts.filter(p => p.currentStock <= p.minStock);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm"><p className="text-slate-500 text-sm">Mặt hàng</p><h3 className="text-3xl font-bold">{activeProducts.length}</h3></div>
        <div className="bg-white p-6 rounded-xl border shadow-sm border-l-4 border-l-green-500"><p className="text-slate-500 text-sm flex items-center gap-1"><DollarSign size={14}/> Giá trị tồn</p><h3 className="text-3xl font-bold text-green-600">{totalValue.toLocaleString()}đ</h3></div>
        <div className="bg-white p-6 rounded-xl border shadow-sm"><p className="text-slate-500 text-sm">Sắp hết hàng</p><h3 className="text-3xl font-bold text-red-500">{low.length}</h3></div>
      </div>
    </div>
  );
};

const Products = ({ data, setData, addLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Cái', price: 0, minStock: 5 });
  const list = data.products.filter(p => p.isActive);

  const save = (e) => {
    e.preventDefault();
    const product = { ...form, id: editP?.id || Date.now(), isActive: true, currentStock: editP?.currentStock || 0 };
    if (editP) setData(prev => ({ ...prev, products: prev.products.map(p => p.id === product.id ? product : p) }));
    else setData(prev => ({ ...prev, products: [...prev.products, product] }));
    setShowForm(false);
    addLog(`${editP ? 'Sửa' : 'Thêm'} hàng: ${form.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh mục hàng hóa</h2>
        <button onClick={() => { setShowForm(true); setEditP(null); setForm({sku:'', name:'', unit:'Cái', price:0, minStock:5}) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Thêm hàng</button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase">
            <tr><th className="px-6 py-4">SKU</th><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">Tồn kho</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td>
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditP(p); setForm(p); setShowForm(true); }} className="text-blue-500 mr-3"><Edit2 size={16}/></button>
                  <button onClick={() => { if(window.confirm('Xóa?')) setData(prev=>({...prev, products: prev.products.map(x=>x.id===p.id?{...x,isActive:false}:x)})) }} className="text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">{editP ? 'Sửa hàng' : 'Thêm hàng'}</h3>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded" placeholder="Tên hàng" required />
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} className="w-full border p-2 rounded" placeholder="Mã SKU" required />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="border p-2 rounded" placeholder="Giá vốn" />
              <input value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="border p-2 rounded" placeholder="Đơn vị" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2 border rounded">Hủy</button>
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
      [type === 'in' ? 'receipts' : 'issues']: [{ id: Date.now(), code: `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`, date: new Date().toLocaleString('vi-VN'), user: currentUser.name, items: [...cart] }, ...prev[type === 'in' ? 'receipts' : 'issues']]
    }));
    addLog(`Phiếu ${type==='in'?'nhập':'xuất'} kho`);
    setCart([]);
    alert("Thành công!");
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div><h2 className="text-2xl font-bold mb-4">{type==='in'?'Nhập kho':'Xuất kho'}</h2>
        <div className="bg-white border rounded-xl h-[500px] overflow-y-auto">
          {products.map(p => (
            <button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 border-b hover:bg-slate-50 flex justify-between items-center">
              <span>{p.name} <small className="block text-slate-400">Tồn: {p.currentStock}</small></span><Plus size={16} className="text-blue-500" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border flex flex-col shadow-sm">
        <h3 className="font-bold mb-4 border-b pb-2">Danh sách phiếu</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <span className="font-medium text-sm">{i.name}</span>
              <div className="flex items-center gap-2">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Number(e.target.value); setCart(n); }} className="w-16 border rounded p-1 text-center" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-400"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg font-bold shadow-lg shadow-blue-200">XÁC NHẬN PHIẾU</button>
      </div>
    </div>
  );
};

const HistoryTable = ({ data }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lịch sử phiếu</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-500"><tr><th className="px-6 py-4">Mã</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày</th><th className="px-6 py-4">Người lập</th></tr></thead>
          <tbody className="divide-y">
            {all.map(d => (<tr key={d.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold text-blue-600">{d.code}</td><td className="px-6 py-4">{d.type}</td><td className="px-6 py-4 text-slate-500">{d.date}</td><td className="px-6 py-4 font-medium">{d.user}</td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserManagement = ({ data, setData, addLog }) => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });
  const handleSave = (e) => {
    e.preventDefault();
    if (editUser) setData(prev => ({ ...prev, users: prev.users.map(u => u.id === editUser.id ? { ...form, id: u.id } : u) }));
    else setData(prev => ({ ...prev, users: [...prev.users, { ...form, id: Date.now() }] }));
    setShowModal(false);
    addLog(`${editUser?'Sửa':'Tạo'} TK: ${form.username}`);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Quản lý tài khoản</h2><button onClick={() => { setShowModal(true); setEditUser(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Thêm người dùng</button></div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-500"><tr><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Username</th><th className="px-6 py-4">Quyền</th><th className="px-6 py-4 text-right">Thao tác</th></tr></thead>
          <tbody className="divide-y">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{u.name}</td><td className="px-6 py-4 text-blue-600">{u.username}</td><td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditUser(u); setForm(u); setShowModal(true); }} className="text-blue-500 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => { if(u.username!=='admin' && window.confirm('Xóa?')) setData(prev=>({...prev, users: prev.users.filter(x=>x.id!==u.id)})) }} className="text-red-400"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">{editUser ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded" placeholder="Họ và tên" required />
            <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-2 rounded" placeholder="Username" required />
            <input type="text" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-2 rounded" placeholder="Mật khẩu" required />
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-2 rounded"><option value="editor">Nhân viên</option><option value="admin">Quản trị viên</option></select>
            <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2 border rounded">Hủy</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded">Lưu</button></div>
          </form>
        </div>
      )}
    </div>
  );
};