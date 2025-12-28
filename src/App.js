/* ================== PHIÊN BẢN CẬP NHẬT: QUẢN LÝ TÀI KHOẢN ================== */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, AlertTriangle, LogOut, Trash2, Search,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, Key
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <Package className="mx-auto text-blue-600 mb-2" size={40} />
            <h1 className="text-2xl font-bold">Warehouse Pro</h1>
          </div>
          <input className="w-full border p-3 rounded-lg" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-lg" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col">
        <div className="font-bold text-white mb-8 flex items-center gap-2"><ShieldCheck /> W-MANAGER</div>
        <nav className="space-y-1 flex-1 text-sm">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />
          <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
          <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
          {currentUser.role === 'admin' && (
            <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Quản lý tài khoản" />
          )}
        </nav>
        <button onClick={() => setCurrentUser(null)} className="text-red-400 p-2 mt-4 flex items-center gap-2 text-sm font-medium"><LogOut size={16}/> Đăng xuất</button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {activeTab === 'dashboard' && <div className="text-2xl font-bold">Chào mừng {currentUser.name}!</div>}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} addLog={addLog} />}
        {/* Các component khác giữ nguyên như cũ... */}
      </main>
    </div>
  );
}

const NavBtn = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
    <Icon size={18} /> {label}
  </button>
);

/* ================== COMPONENT QUẢN LÝ TÀI KHOẢN ================== */
const UserManagement = ({ data, setData, addLog }) => {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });

  const handleSave = (e) => {
    e.preventDefault();
    if (editUser) {
      setData(prev => ({ ...prev, users: prev.users.map(u => u.id === editUser.id ? { ...form, id: u.id } : u) }));
      addLog(`Sửa tài khoản ${form.username}`);
    } else {
      setData(prev => ({ ...prev, users: [...prev.users, { ...form, id: Date.now() }] }));
      addLog(`Tạo tài khoản ${form.username}`);
    }
    setShowModal(false);
    setEditUser(null);
    setForm({ username: '', password: '', name: '', role: 'editor' });
  };

  const deleteUser = (u) => {
    if (u.username === 'admin') return alert("Không thể xóa Admin gốc!");
    if (window.confirm(`Xóa tài khoản ${u.username}?`)) {
      setData(prev => ({ ...prev, users: prev.users.filter(x => x.id !== u.id) }));
      addLog(`Xóa tài khoản ${u.username}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
        <button onClick={() => { setShowModal(true); setEditUser(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18} /> Thêm người dùng</button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Mật khẩu</th>
              <th className="px-6 py-4">Quyền</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{u.name}</td>
                <td className="px-6 py-4 text-blue-600">{u.username}</td>
                <td className="px-6 py-4 font-mono">****</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditUser(u); setForm(u); setShowModal(true); }} className="text-blue-500 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => deleteUser(u)} className="text-red-400"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold">{editUser ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" placeholder="Họ và tên" required />
            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border p-2 rounded" placeholder="Tên đăng nhập" required />
            <div className="relative">
              <input type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2 rounded" placeholder="Mật khẩu" required />
              <Key className="absolute right-2 top-2.5 text-slate-300" size={16} />
            </div>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border p-2 rounded">
              <option value="editor">Nhân viên (Editor)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded hover:bg-slate-50">Hủy</button>
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu lại</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};