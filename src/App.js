import React, { useState, useEffect } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, UserCheck, Save
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CẤU HÌNH HỆ THỐNG ---
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);
const STORE_ID = "kho_chinh_pro_001"; 

const RANKS = ["Thiếu úy", "Trung úy", "Thượng úy", "Đại úy", "Thiếu tá", "Trung tá", "Thượng tá", "Đại tá"];
const ROLES = ['Người lập', 'Người giao/nhận', 'Thủ kho', 'Trưởng ban', 'Chủ nhiệm'];
const USER_ROLES = [
  { val: 'admin', label: 'Quản trị (Toàn quyền)' },
  { val: 'thukho', label: 'Thủ kho (Điều chỉnh số lượng)' },
  { val: 'coquan', label: 'Cơ quan (Lập phiếu)' },
  { val: 'view', label: 'Thành phần khác (Chỉ xem)' }
];

// Hàm đọc số tiền sang tiếng Việt (Giữ nguyên)
function docSoTiengViet(so) {
    if (so === 0) return "Không đồng";
    const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const donVi = ["", "ngàn", "triệu", "tỷ"];
    let res = ""; let i = 0; let so_str = Math.floor(so).toString();
    while (so_str.length > 0) {
        let group = parseInt(so_str.substring(Math.max(0, so_str.length - 3)));
        so_str = so_str.substring(0, Math.max(0, so_str.length - 3));
        if (group > 0) {
            let tram = Math.floor(group / 100); let chuc = Math.floor((group % 100) / 10); let donvi = group % 10;
            let group_str = "";
            if (tram > 0) group_str += chuSo[tram] + " trăm "; else if (res !== "") group_str += "không trăm ";
            if (chuc > 1) group_str += chuSo[chuc] + " mươi "; else if (chuc === 1) group_str += "mười "; else if (tram > 0 && donvi > 0) group_str += "lẻ ";
            if (donvi === 5 && chuc > 0) group_str += "lăm "; else if (donvi === 1 && chuc > 1) group_str += "mốt "; else if (donvi > 0 || (tram === 0 && chuc === 0 && res === "")) group_str += chuSo[donvi] + " ";
            res = group_str + donVi[i] + " " + res;
        }
        i++;
    }
    return res.trim().charAt(0).toUpperCase() + res.trim().slice(1) + " đồng.";
}

const initialData = {
  users: [{ id: 1, username: 'admin', password: '123', role: 'admin', name: 'Nguyễn Lê Nhật Ký' }],
  products: [], receipts: [], issues: [], logs: [], audits: [],
  staff: [{ id: 1, role: 'Thủ kho', name: 'Nguyễn Thị Nga', rank: 'Thiếu tá' }]
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    const loadData = async () => {
      try {
        let { data: cloud } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
        if (cloud && cloud.content) {
          setData({ ...initialData, ...cloud.content });
        }
      } finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && isOnline) {
      const t = setTimeout(() => supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data }), 1000);
      return () => clearTimeout(t);
    }
  }, [data, loading, isOnline]);

  const addSystemLog = (action) => {
    const newLog = { id: Date.now(), user: currentUser?.name || 'Hệ thống', action, time: new Date().toLocaleString('vi-VN') };
    setData(prev => ({ ...prev, logs: [newLog, ...(prev.logs || [])].slice(0, 100) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold italic">Đang tải hệ thống...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={e => { e.preventDefault(); const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password); if (u) { setCurrentUser(u); addSystemLog('Đăng nhập'); } else alert('Sai tài khoản!'); }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6"><ShieldCheck className="text-blue-600 mx-auto mb-2" size={48} /><h1 className="text-2xl font-black uppercase italic">Warehouse Pro</h1></div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" element className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase hover:bg-blue-600 transition-colors">Đăng nhập</button>
        </form>
      </div>
    );
  }

  // LOGIC PHÂN QUYỀN TRUY CẬP TAB
  const canAccess = (tab) => {
    const r = currentUser.role;
    if (r === 'admin') return true;
    if (r === 'thukho') return ['dashboard', 'products', 'audit'].includes(tab);
    if (r === 'coquan') return ['dashboard', 'products', 'in', 'out', 'history'].includes(tab);
    if (r === 'view') return ['dashboard', 'products'].includes(tab);
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-8 flex flex-col gap-1 px-2 italic text-xl"><Activity className="inline text-blue-500 mr-2"/>W-MANAGER</div>
        <nav className="space-y-1 flex-1 text-xs font-bold uppercase">
          {canAccess('dashboard') && <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo" />}
          {canAccess('products') && <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />}
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest">GIAO DỊCH</div>
          {canAccess('in') && <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />}
          {canAccess('out') && <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />}
          {canAccess('history') && <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử" />}
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest">HỆ THỐNG</div>
          {canAccess('staff') && <NavBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={UserCheck} label="Cán bộ ký" />}
          {canAccess('audit') && <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={ClipboardCheck} label="Kiểm kê" />}
          {currentUser.role === 'admin' && <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Tài khoản" />}
        </nav>
        <div className="p-3 bg-slate-800/50 rounded-xl mb-2 text-[10px]">
           <p className="text-blue-400 font-bold">User: {currentUser.name}</p>
           <p className="text-slate-500 italic">Quyền: {USER_ROLES.find(r=>r.val===currentUser.role)?.label}</p>
        </div>
        <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-xl transition-colors"><LogOut size={14}/> ĐĂNG XUẤT</button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} log={addSystemLog} user={currentUser} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'history' && <HistoryTable data={data} setData={setData} onOpenDetail={setSelectedDoc} log={addSystemLog} user={currentUser} />}
        {activeTab === 'staff' && <StaffManagement data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'audit' && <AuditManagement data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} log={addSystemLog} />}
      </main>

      {/* MODAL CHI TIẾT PHIẾU / IN PHIẾU */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8 shadow-2xl">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => { 
                const listKey = selectedDoc.type === 'Nhập' ? 'receipts' : 'issues';
                setData(prev => ({...prev, [listKey]: (prev[listKey] || []).map(d => d.id === selectedDoc.id ? {...d, isLocked: true} : d)}));
                window.print(); 
              }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700"><Printer size={18}/> IN & KHÓA</button>
              <button onClick={() => setSelectedDoc(null)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"><X/></button>
            </div>
            <PrintTemplate doc={selectedDoc} />
          </div>
        </div>
      )}
    </div>
  );
}

const NavBtn = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
    <Icon size={16} /> {label}
  </button>
);

// --- COMPONENT: QUẢN LÝ TÀI KHOẢN (Admin chọn vai trò) ---
const UserManagement = ({ data, setData, log }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'view' });
  const saveUser = (e) => {
    e.preventDefault();
    if(data.users.find(u=>u.username===form.username)) return alert("Tên đăng nhập đã tồn tại!");
    setData(prev => ({ ...prev, users: [...(prev.users || []), { ...form, id: Date.now() }] }));
    log(`Tạo user: ${form.username} (${form.role})`);
    setShowModal(false); setForm({ username: '', password: '', name: '', role: 'view' });
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Quản lý tài khoản</h2><button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg">+ TẠO MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold uppercase"><table className="w-full text-left"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Tài khoản</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{(data.users || []).map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4">{u.name}</td><td className="px-6 py-4 font-mono text-blue-600">{u.username}</td><td className="px-6 py-4 text-blue-600 font-bold">{USER_ROLES.find(r=>r.val===u.role)?.label}</td><td className="px-6 py-4 text-center"><button disabled={u.username === 'admin'} onClick={() => setData(prev => ({...prev, users: prev.users.filter(x => x.id !== u.id)}))} className="text-red-400 disabled:opacity-20"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showModal && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm"><form onSubmit={saveUser} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl font-sans"><h3 className="text-xl font-black uppercase italic border-b pb-2">Thêm tài khoản</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Họ tên" required /><input value={form.username} onChange={e=>setForm({...form, username:e.target.value.toLowerCase()})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Tên đăng nhập" required /><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Mật khẩu" required /><div className="space-y-1"><label className="text-[10px] text-slate-400 font-bold uppercase">Vai trò hệ thống</label><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold border-blue-200">{USER_ROLES.map(r=><option key={r.val} value={r.val}>{r.label}</option>)}</select></div><div className="flex gap-3 pt-2"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 font-bold text-slate-400 uppercase text-xs">Hủy</button><button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold uppercase text-xs">Lưu lại</button></div></form></div>}
    </div>
  );
};

// --- COMPONENT: CÁN BỘ KÝ (Thêm/Sửa/Cấp bậc) ---
const StaffManagement = ({ data, setData, log }) => {
  const [form, setForm] = useState({ role: 'Thủ kho', name: '', rank: 'Đại úy' });
  const [editingId, setEditingId] = useState(null);
  const saveStaff = () => {
    if(!form.name) return;
    if(editingId) {
      setData(prev => ({ ...prev, staff: (prev.staff || []).map(s => s.id === editingId ? { ...form, id: editingId } : s) }));
      log(`Sửa cán bộ: ${form.name}`); setEditingId(null);
    } else {
      setData(prev => ({ ...prev, staff: [...(prev.staff || []), { ...form, id: Date.now() }] }));
      log(`Thêm cán bộ: ${form.name}`);
    }
    setForm({ role: 'Thủ kho', name: '', rank: 'Đại úy' });
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Cán bộ ký duyệt</h2>
      <div className="bg-white p-6 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end font-bold text-[11px]">
        <div><label className="text-slate-400 block mb-1 uppercase">Chức danh</label><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-2.5 rounded-lg bg-slate-50">{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className="text-slate-400 block mb-1 uppercase">Cấp bậc</label><select value={form.rank} onChange={e=>setForm({...form, rank:e.target.value})} className="w-full border p-2.5 rounded-lg bg-slate-50">{RANKS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className="text-slate-400 block mb-1 uppercase">Họ và tên</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2.5 rounded-lg bg-slate-50 font-bold" placeholder="VD: Nguyễn Văn A" /></div>
        <button onClick={saveStaff} className={`p-2.5 rounded-lg font-bold uppercase text-[10px] text-white transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden uppercase font-bold text-xs font-sans"><table className="w-full text-left"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Chức vụ</th><th className="px-6 py-4">Cấp bậc</th><th className="px-6 py-4">Họ và tên</th><th className="px-6 py-4 text-center">Thao tác</th></tr></thead>
      <tbody className="divide-y">{(data.staff || []).map(s => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-blue-600">{s.role}</td><td className="px-6 py-4 italic font-medium">{s.rank}</td><td className="px-6 py-4">{s.name}</td><td className="px-6 py-4 text-center flex justify-center gap-4"><button onClick={() => {setEditingId(s.id); setForm({role:s.role, name:s.name, rank:s.rank})}} className="text-orange-500 flex items-center gap-1 hover:scale-110 transition-transform"><Edit2 size={14}/> SỬA</button><button onClick={()=>{if(window.confirm('Xóa?')) setData(prev=>({...prev, staff: prev.staff.filter(x=>x.id!==s.id)}));}} className="text-red-400 hover:scale-125 transition-transform"><Trash2 size={14}/></button></td></tr>))}</tbody></table></div>
    </div>
  );
};

// --- COMPONENT: KIỂM KÊ (Thủ kho chỉnh số lượng) ---
const AuditManagement = ({ data, setData, log }) => {
  const [counts, setCounts] = useState({});
  const saveAudit = () => {
    setData(prev => ({ ...prev, audits: [{ id: Date.now(), date: new Date().toLocaleString() }, ...(prev.audits || [])], products: prev.products.map(p => ({ ...p, currentStock: counts[p.id] !== undefined ? Number(counts[p.id]) : p.currentStock })) }));
    log(`Điều chỉnh tồn kho thực tế`); alert("Đã cập nhật số dư kho thành công!"); setCounts({});
  };
  return (
    <div className="space-y-6 uppercase font-bold">
      <div className="flex justify-between items-center italic"><h2 className="text-2xl font-black">Kiểm kê & Điều chỉnh số lượng</h2><button onClick={saveAudit} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg">XÁC NHẬN SỐ DƯ MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden font-sans"><table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b"><tr><th className="px-6 py-4">Tên vật chất</th><th className="px-6 py-4 text-center">Số lượng hệ thống</th><th className="px-6 py-4 text-center">Số lượng thực tế</th></tr></thead>
      <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold">{p.name}</td><td className="px-6 py-4 text-center font-mono text-slate-400">{p.currentStock}</td><td className="px-6 py-4 text-center"><input type="number" value={counts[p.id] !== undefined ? counts[p.id] : p.currentStock} onChange={e => setCounts({...counts, [p.id]: e.target.value})} className="w-24 border rounded-lg p-2 text-center bg-blue-50 text-blue-600 font-black outline-none border-blue-200 focus:bg-white" /></td></tr>))}</tbody></table></div>
    </div>
  );
};

// --- COMPONENT: GIAO DỊCH (Lập phiếu Nhập/Xuất) ---
const Transaction = ({ type, data, setData, user, log }) => {
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState({ source: '', refCode: '' });
  const [signers, setSigners] = useState({
    maker: { name: user.name, rank: 'Đại úy' }, receiver: { name: '', rank: '' },
    keeper: (data.staff || []).find(s=>s.role==='Thủ kho') || { name: '', rank: '' },
    chief: (data.staff || []).find(s=>s.role==='Trưởng ban') || { name: '', rank: '' },
    manager: (data.staff || []).find(s=>s.role==='Chủ nhiệm') || { name: '', rank: '' }
  });
  const save = () => {
    if (!cart.length) return alert("Chưa chọn hàng!");
    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    const newDoc = { id: Date.now(), type: type==='in'?'Nhập':'Xuất', code, date: new Date().toLocaleString('vi-VN'), items: [...cart], isLocked: false, ...info, signers };
    setData(prev => ({ ...prev, 
      products: (prev.products || []).map(p => { const i = cart.find(x => x.id === p.id); return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p; }),
      [type === 'in' ? 'receipts' : 'issues']: [newDoc, ...(prev[type === 'in' ? 'receipts' : 'issues'] || [])]
    }));
    log(`Lập phiếu: ${code}`); setCart([]); alert("Lưu phiếu thành công!");
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold uppercase tracking-tighter">
      <div>
        <h2 className="text-2xl font-black mb-6 italic">{type==='in'?'Nhập kho vật chất':'Xuất kho vật chất'}</h2>
        <div className="bg-white border rounded-3xl h-[400px] overflow-y-auto divide-y shadow-sm">
          {(data.products || []).filter(p => p.isActive).map(p => (
            <button key={p.id} onClick={() => { const ex = cart.find(x => x.id === p.id); if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x)); else setCart([...cart, {...p, qty: 1}]); }} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center group transition-colors">
              <div><span className="text-slate-800 block font-bold">{p.name}</span><span className="text-[10px] text-slate-400 font-bold uppercase">Tồn: {p.currentStock} {p.unit}</span></div>
              <Plus size={18} className="text-blue-500 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
        <div className="mt-6 bg-white p-6 rounded-3xl border shadow-sm space-y-4 font-sans">
          <h3 className="text-[10px] text-blue-600 border-b pb-2 tracking-widest uppercase font-bold">Thành phần ký duyệt</h3>
          <div className="grid grid-cols-2 gap-4">
            <SignerSelect label="Thủ kho" list={(data.staff || []).filter(s=>s.role==='Thủ kho')} value={signers.keeper} onChange={v=>setSigners({...signers, keeper: v})} />
            <SignerSelect label="Trưởng ban" list={(data.staff || []).filter(s=>s.role==='Trưởng ban')} value={signers.chief} onChange={v=>setSigners({...signers, chief: v})} />
            <SignerSelect label="Chủ nhiệm" list={(data.staff || []).filter(s=>s.role==='Chủ nhiệm')} value={signers.manager} onChange={v=>setSigners({...signers, manager: v})} />
            <div><label className="text-[9px] text-slate-400 block mb-1 uppercase font-bold">Người nhận/giao</label><input value={signers.receiver.name} onChange={e=>setSigners({...signers, receiver: {name: e.target.value, rank: ''}})} className="w-full border p-2 rounded-lg bg-slate-50 text-[11px] font-bold outline-none border-blue-100" placeholder="Họ tên..." /></div>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl h-fit border border-slate-800">
        <h3 className="text-blue-400 mb-6 border-b border-slate-800 pb-4 text-xs font-black uppercase tracking-widest">Nội dung phiếu {type==='in'?'Nhập':'Xuất'}</h3>
        <div className="space-y-4 mb-6"><input className="w-full bg-slate-800 border-none p-4 rounded-xl outline-none font-bold" placeholder={type==='in'?'Nguồn hàng...':'Nơi nhận...'} value={info.source} onChange={e=>setInfo({...info, source:e.target.value})} /><input className="w-full bg-slate-800 border-none p-4 rounded-xl outline-none text-xs font-bold" placeholder="Mã lệnh/Số hiệu" value={info.refCode} onChange={e=>setInfo({...info, refCode:e.target.value})} /></div>
        <div className="space-y-2 max-h-44 overflow-y-auto mb-6 pr-2">
          {cart.map((i, idx) => (<div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700"><span className="text-[10px] truncate w-32 font-black italic">{i.name}</span><div className="flex items-center gap-3"><input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-16 bg-slate-900 border-none rounded p-1 text-center text-blue-400 text-xs font-black outline-none" /><button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={14}/></button></div></div>))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-all">Lưu & Xuất phiếu in</button>
      </div>
    </div>
  );
};

const SignerSelect = ({ label, list, value, onChange }) => (
  <div>
    <label className="text-[9px] text-slate-400 block mb-1 uppercase font-bold">{label}</label>
    <select value={value?.name || ''} onChange={e => { const s = list.find(x => x.name === e.target.value); if(s) onChange({ name: s.name, rank: s.rank }); else onChange({ name: e.target.value, rank: '' }); }} className="w-full border p-2 rounded-lg bg-slate-50 text-[11px] font-bold outline-none cursor-pointer">
      <option value="">-- Chọn cán bộ --</option>
      {(list || []).map(s => <option key={s.id} value={s.name}>{s.rank} {s.name}</option>)}
    </select>
  </div>
);

// --- COMPONENT: BÁO CÁO (Dashboard) ---
const Dashboard = ({ data }) => {
  const activeProducts = (data.products || []).filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 uppercase italic underline decoration-blue-500 underline-offset-8">Tổng quan kho tàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold uppercase tracking-widest text-[11px]">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={30}/></div><div><p className="text-slate-400">Chủng loại vật chất</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div></div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={30}/></div><div><p className="text-slate-400">Tổng giá trị tồn kho</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div></div>
      </div>
      <div className="bg-slate-900 text-white p-5 rounded-2xl border-l-4 border-l-orange-500 shadow-lg">
        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14}/> Trạng thái hệ thống</h4>
        <p className="text-[10px] font-mono italic opacity-70">- Đồng bộ Cloud: Hoạt động (Supabase)</p>
        <p className="text-[10px] font-mono italic opacity-70">- Mã lệnh Zero line: Đã nạp cấu trúc cho M1.</p>
      </div>
    </div>
  );
};

// --- COMPONENT: DANH MỤC HÀNG HÓA ---
const Products = ({ data, setData, log, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });
  const isAdmin = user.role === 'admin';
  const save = (e) => { e.preventDefault(); setData(prev => ({ ...prev, products: [...(prev.products || []), { ...form, id: Date.now(), isActive: true, currentStock: 0 }] })); log(`Thêm hàng: ${form.name}`); setShowForm(false); };
  return (
    <div className="space-y-6 font-bold uppercase">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black italic">Danh mục vật chất</h2>{isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 hover:bg-blue-700">+ THÊM MỚI</button>}</div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-sans"><table className="w-full text-left uppercase font-bold"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Mã SKU</th><th className="px-6 py-4">Tên vật chất</th><th className="px-6 py-4 text-center">Tồn kho</th>{isAdmin && <th className="px-6 py-4 text-center">Thao tác</th>}</tr></thead>
      <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-mono text-blue-600 underline decoration-blue-200">{p.sku}</td><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td>{isAdmin && <td className="px-6 py-4 text-center"><button onClick={() => setData(prev => ({...prev, products: prev.products.map(x => x.id === p.id ? {...x, isActive: false} : x)}))} className="text-red-400 hover:scale-125 transition-transform"><Trash2 size={16}/></button></td>}</tr>))}</tbody></table></div>
      {showForm && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl font-sans"><h3 className="text-xl font-black uppercase italic border-b pb-2">Thêm vật chất mới</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50 outline-none" placeholder="Tên vật chất" required /><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl font-mono bg-slate-50 outline-none" placeholder="Mã SKU (VD: M1-01)" required /><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl font-bold bg-slate-50 outline-none" placeholder="Đơn giá (VNĐ)" required /><div className="flex gap-3 pt-2"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 font-bold text-slate-400 uppercase text-xs">Hủy</button><button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold uppercase text-xs">Lưu lại</button></div></form></div>}
    </div>
  );
};

// --- COMPONENT: LỊCH SỬ GIAO DỊCH ---
const HistoryTable = ({ data, setData, onOpenDetail, log, user }) => {
  const all = [...(data.receipts || []).map(r => ({...r, type: 'Nhập'})), ...(data.issues || []).map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  const isAdmin = user.role === 'admin';
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <h2 className="text-2xl font-black">Lịch sử giao dịch phiếu</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-[11px] font-sans font-bold"><table className="w-full text-left uppercase"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại hình</th><th className="px-6 py-4 text-center">Trạng thái</th>{isAdmin && <th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{all.map(d => (<tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(d)}><td className="px-6 py-4 text-blue-600 font-mono underline">{d.code}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-black ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{d.type} KHO</span></td><td className="px-6 py-4 text-center">{d.isLocked ? <div className="flex justify-center text-red-500 gap-1"><Lock size={12}/> ĐÃ KHÓA</div> : <div className="flex justify-center text-slate-300 gap-1"><Edit2 size={12}/> CHƯA KHÓA</div>}</td>{isAdmin && <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}><button onClick={() => { if(!d.isLocked && window.confirm('Xóa phiếu này?')) setData(prev => ({...prev, [d.type==='Nhập'?'receipts':'issues']: prev[d.type==='Nhập'?'receipts':'issues'].filter(x => x.id !== d.id)})); }} className="text-red-400 hover:scale-125 transition-transform"><Trash2 size={16}/></button></td>}</tr>))}</tbody></table></div>
    </div>
  );
};

// --- COMPONENT: MẪU IN PHIẾU (Font Serif chuyên dụng) ---
const PrintTemplate = ({ doc }) => {
  const isReceipt = doc.type === 'Nhập';
  const totalAmount = (doc.items || []).reduce((sum, i) => sum + (i.qty * i.price), 0);
  const s = doc.signers || {};
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`@media print { .no-print { display: none !important; } } .print-table th, .print-table td { border: 1px solid black; padding: 5px; } .print-table { border-collapse: collapse; width: 100%; margin-top: 15px; }`}</style>
      <div className="flex justify-between items-start mb-6 text-center">
        <div><p className="uppercase text-[11px]">QUÂN KHU 4</p><p className="uppercase font-bold text-[11px] underline underline-offset-4 decoration-1">SƯ ĐOÀN 968</p></div>
        <div className="flex-1"><h2 className="text-2xl font-bold uppercase">{doc.type} KHO VẬT CHẤT</h2></div>
        <div className="text-right text-[11px]"><p>Số: <span className="font-bold">{doc.code?.split('-')[1]}</span></p></div>
      </div>
      <div className="space-y-1 mb-6 text-[14px]">
        <p>{isReceipt ? 'Nhập của' : 'Xuất cho'}: <span className="font-bold underline">{doc.source || '..........'}</span></p>
        <p>Lệnh số: <span className="font-bold">{doc.refCode}</span>. Tại: <span className="font-bold">Kho 26, Sư đoàn 968.</span></p>
      </div>
      <table className="print-table text-[12px] text-center">
        <thead><tr className="font-bold uppercase"><th>TT</th><th className="w-[40%]">Tên hàng, quy cách</th><th>ĐVT</th><th>Số lượng</th><th>Thành tiền</th></tr></thead>
        <tbody>
          {(doc.items || []).map((item, idx) => (
            <tr key={idx}><td>{idx + 1}</td><td className="text-left font-bold">{item.name}</td><td>{item.unit}</td><td className="font-bold">{item.qty}</td><td className="text-right">{(item.qty * item.price)?.toLocaleString()}</td></tr>
          ))}
          <tr className="font-bold"><td colSpan="4" className="text-right uppercase">Tổng cộng:</td><td className="text-right">{totalAmount.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <p className="mt-4 text-[13px] italic font-bold">Bằng chữ: {docSoTiengViet(totalAmount)}</p>
      <div className="mt-10 grid grid-cols-5 text-center text-[10px] font-bold uppercase leading-tight gap-1">
        <div><p>Người lập phiếu</p><div className="h-16"></div><p>{s.maker?.rank}</p><p>{s.maker?.name}</p></div>
        <div><p>{isReceipt ? 'Người giao' : 'Người nhận'}</p><div className="h-16"></div><p>{s.receiver?.rank}</p><p>{s.receiver?.name || '..........'}</p></div>
        <div><p>Thủ kho</p><div className="h-16"></div><p>{s.keeper?.rank}</p><p>{s.keeper?.name}</p></div>
        <div><p>Trưởng ban</p><div className="h-16"></div><p>{s.chief?.rank}</p><p>{s.chief?.name}</p></div>
        <div><p className="normal-case italic font-normal mb-1">Ngày {doc.date?.split(' ')[0]}</p><p>TL. Sư đoàn trưởng</p><div className="h-16"></div><p>{s.manager?.rank}</p><p>{s.manager?.name}</p></div>
      </div>
    </div>
  );
};