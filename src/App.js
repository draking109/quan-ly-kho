import React, { useState, useEffect } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, UserCheck, Save, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- HỆ THỐNG VÀ CẤU HÌNH ---
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);
const STORE_ID = "kho_chinh_pro_001"; 

const RANKS = ["Thiếu úy", "Trung úy", "Thượng úy", "Đại úy", "Thiếu tá", "Trung tá", "Thượng tá", "Đại tá"];
const POSITIONS = ["Thủ kho", "Trưởng ban", "Chủ nhiệm", "Người lập phiếu", "Người giao hàng", "Người nhận hàng"];
const USER_ROLES = [
  { val: 'admin', label: 'Quản trị (Toàn quyền)' },
  { val: 'thukho', label: 'Thủ kho (Điều chỉnh số lượng)' },
  { val: 'coquan', label: 'Cơ quan (Lập phiếu)' },
  { val: 'view', label: 'Thành phần khác (Chỉ xem)' }
];

// Hàm xuất Excel
const exportToExcel = (fileName, sheetName, headers, rows) => {
  let xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`;
  xml += `<Worksheet ss:Name="${sheetName}"><Table>`;
  xml += `<Row>` + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + `</Row>`;
  rows.forEach(row => {
    xml += `<Row>` + row.map(cell => `<Cell><Data ss:Type="${typeof cell === 'number' ? 'Number' : 'String'}">${cell}</Data></Cell>`).join('') + `</Row>`;
  });
  xml += `</Table></Worksheet></Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${fileName}.xls`; a.click();
};

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
  staff: [{ id: 1, role: 'Thủ kho', name: 'Nguyễn Thị Nga', rank: 'Thiếu tá' }],
  adjustments: []
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
        if (cloud && cloud.content) setData({ ...initialData, ...cloud.content });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold italic text-slate-500">Đang khởi tạo hệ thống quản lý...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={e => { e.preventDefault(); const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password); if (u) { setCurrentUser(u); addSystemLog('Đăng nhập'); } else alert('Sai tài khoản hoặc mật khẩu!'); }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6"><ShieldCheck className="text-blue-600 mx-auto mb-2" size={48} /><h1 className="text-2xl font-black uppercase italic">Warehouse Pro</h1></div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase hover:bg-blue-600 transition-colors">Đăng nhập</button>
        </form>
      </div>
    );
  }

  const canAccess = (tab) => {
    const r = currentUser.role;
    if (r === 'admin') return true;
    if (r === 'thukho') return ['dashboard', 'products', 'audit', 'staff', 'history', 'adjust'].includes(tab);
    if (r === 'coquan') return ['dashboard', 'products', 'in', 'out', 'history'].includes(tab);
    if (r === 'view') return ['dashboard', 'products'].includes(tab);
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-8 flex flex-col gap-1 px-2 italic text-xl border-b border-slate-800 pb-4"><Activity className="inline text-blue-500 mr-2"/>W-MANAGER</div>
        <nav className="space-y-1 flex-1 text-xs font-bold uppercase">
          {canAccess('dashboard') && <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo" />}
          {canAccess('products') && <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />}
          
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase">Nghiệp vụ</div>
          {canAccess('in') && <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />}
          {canAccess('out') && <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />}
          {canAccess('adjust') && <NavBtn active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={RefreshCw} label="Điều chỉnh kho" />}
          {canAccess('history') && <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử" />}
          
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase">Cấu hình</div>
          {canAccess('staff') && <NavBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={UserCheck} label="Cán bộ ký" />}
          {canAccess('audit') && <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={ClipboardCheck} label="Kiểm kê" />}
          {currentUser.role === 'admin' && <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Tài khoản" />}
        </nav>
        <div className="border-t border-slate-800 pt-4 mt-4">
            <div className="px-3 mb-2 text-[10px] text-blue-400 font-bold italic">{currentUser.name} ({currentUser.role})</div>
            <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-xl transition-colors"><LogOut size={14}/> ĐĂNG XUẤT</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} user={currentUser} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} />}
        {activeTab === 'adjust' && <AdjustmentTool data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'history' && <HistoryTable data={data} onOpenDetail={setSelectedDoc} />}
        {activeTab === 'staff' && <StaffManagement data={data} setData={setData} />}
        {activeTab === 'audit' && <AuditManagement data={data} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} log={addSystemLog} />}
      </main>

      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8 shadow-2xl">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => { 
                  const headers = ["TT", "Tên hàng", "ĐVT", "Số lượng", "Đơn giá", "Thành tiền"];
                  const rows = selectedDoc.items.map((it, idx) => [idx+1, it.name, it.unit, it.qty, it.price, it.qty*it.price]);
                  exportToExcel(`Phieu_${selectedDoc.code}`, "ChiTiet", headers, rows);
              }} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg"><FileSpreadsheet size={18}/> EXCEL</button>
              <button onClick={() => { 
                setData(prev => ({
                  ...prev, 
                  [selectedDoc.type === 'Nhập' ? 'receipts' : 'issues']: prev[selectedDoc.type === 'Nhập' ? 'receipts' : 'issues'].map(d => d.id === selectedDoc.id ? {...d, isLocked: true} : d)
                }));
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

const Dashboard = ({ data }) => {
  const activeProducts = (data.products || []).filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Tổng quan kho tàng</h2>
      <div className="grid grid-cols-2 gap-6 font-bold uppercase">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500"><Package size={30} className="text-blue-500"/><div><p className="text-xs text-slate-400">Chủng loại</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div></div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500"><DollarSign size={30} className="text-emerald-500"/><div><p className="text-xs text-slate-400">Giá trị tồn</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div></div>
      </div>
    </div>
  );
};

const Products = ({ data, setData, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });
  const isAdmin = user.role === 'admin' || user.role === 'thukho';
  const save = (e) => {
    e.preventDefault();
    setData(prev => ({ ...prev, products: [...(prev.products || []), { ...form, id: Date.now(), isActive: true, currentStock: 0 }] }));
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Danh mục vật chất</h2>
        <div className="flex gap-2">
          <button onClick={() => exportToExcel("DM", "Hàng", ["SKU", "Tên", "ĐVT", "Giá", "Tồn"], data.products.map(p=>[p.sku, p.name, p.unit, p.price, p.currentStock]))} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><FileSpreadsheet size={18}/> EXCEL</button>
          {isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold">+ THÊM MỚI</button>}
        </div>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold uppercase tracking-wider">
        <table className="w-full text-left tracking-wider"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Mã SKU</th><th className="px-6 py-4">Tên vật chất</th><th className="px-6 py-4 text-center">Tồn kho</th></tr></thead>
        <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td></tr>))}</tbody></table>
      </div>
      {showForm && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative"><button type="button" onClick={()=>setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X/></button><h3 className="text-xl font-black italic border-b pb-2 uppercase">Thêm hàng mới</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold" placeholder="Tên vật chất" required /><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl font-mono" placeholder="Mã SKU" required /><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl font-bold" placeholder="Đơn giá" required /><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase">Lưu vật chất</button></form></div>}
    </div>
  );
};

const Transaction = ({ type, data, setData }) => {
  const [cart, setCart] = useState([]);
  const [signers, setSigners] = useState({ lập: '', giao: '', nhận: '', trưởng_ban: '', chủ_nhiệm: '' });
  const save = () => {
    if (!cart.length) return alert("Giỏ hàng trống!");
    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    const newDoc = { id: Date.now(), type: type==='in'?'Nhập':'Xuất', code, date: new Date().toLocaleString(), items: [...cart], isLocked: false, signers };
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => { const i = cart.find(x => x.id === p.id); return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p; }),
      [type === 'in' ? 'receipts' : 'issues']: [newDoc, ...(prev[type === 'in' ? 'receipts' : 'issues'] || [])]
    }));
    setCart([]); alert("Lưu phiếu thành công!");
  };
  return (
    <div className="grid grid-cols-2 gap-8 uppercase font-bold italic h-[calc(100vh-160px)]">
      <div className="bg-white border rounded-3xl overflow-y-auto divide-y shadow-sm">
        <div className="p-4 bg-slate-50 border-b sticky top-0 font-sans tracking-normal text-xs uppercase text-slate-400"><Search className="inline mr-2" size={14}/> Tìm vật chất chọn nhanh</div>
        {(data.products || []).filter(p => p.isActive).map(p => (<button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center transition-colors"><div><p>{p.name}</p><p className="text-[10px] text-slate-400 font-sans italic tracking-normal">{p.sku}</p></div><span className="text-blue-600">{p.currentStock}</span></button>))}
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl flex flex-col space-y-4">
        <h3 className="text-blue-400 border-b border-slate-800 pb-2 text-xs font-black uppercase">Thành phần tham gia phiếu</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-sans italic tracking-normal">
            <select className="bg-slate-800 p-2 rounded border border-slate-700 outline-none" onChange={e=>setSigners({...signers, lập:e.target.value})}><option value="">-- Người lập --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700 outline-none" onChange={e=>setSigners({...signers, giao:e.target.value})}><option value="">-- Người giao/nhận --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700 outline-none" onChange={e=>setSigners({...signers, trưởng_ban:e.target.value})}><option value="">-- Trưởng ban --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700 outline-none" onChange={e=>setSigners({...signers, chủ_nhiệm:e.target.value})}><option value="">-- Chủ nhiệm --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 border-t border-slate-800 pt-4">
          {cart.map((i, idx) => (<div key={idx} className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 items-center"><span>{i.name}</span><div className="flex gap-3 items-center"><input type="number" className="w-12 bg-transparent text-center border-b border-slate-600 outline-none" value={i.qty} onChange={e=>{const n=[...cart]; n[idx].qty=Number(e.target.value); setCart(n);}} /><button onClick={()=>setCart(cart.filter((_,j)=>j!==idx))} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={14}/></button></div></div>))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-blue-500 transition-colors">Xác nhận lưu hệ thống</button>
      </div>
    </div>
  );
};

// --- CHỨC NĂNG MỚI: ĐIỀU CHỈNH KHO KHÔNG TIỀN ---
const AdjustmentTool = ({ data, setData, log }) => {
  const [targetId, setTargetId] = useState('');
  const [qty, setQty] = useState(0);

  const apply = (mode) => {
    if (!targetId || qty <= 0) return alert("Chọn hàng và nhập số lượng!");
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id == targetId ? { ...p, currentStock: mode === 'add' ? p.currentStock + qty : p.currentStock - qty } : p)
    }));
    log(`${mode === 'add' ? 'Nhập bù' : 'Xuất bù'} không phiếu: ${qty} đơn vị`);
    setQty(0); alert("Đã cập nhật tồn kho!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic text-orange-600 flex items-center gap-2"><RefreshCw/> Điều chỉnh kho (Không tiền)</h2>
      <div className="bg-white p-8 rounded-3xl border shadow-sm max-w-lg space-y-4 italic font-bold">
        <p className="text-xs text-slate-400 tracking-tight">Dùng cho trường hợp nhập/xuất vật chất lẻ, không qua hóa đơn tài chính.</p>
        <div>
          <label className="text-xs block mb-1">Chọn vật chất:</label>
          <select value={targetId} onChange={e=>setTargetId(e.target.value)} className="w-full border p-3 rounded-xl bg-slate-50 uppercase">
            <option value="">-- Chọn hàng hóa --</option>
            {data.products.map(p => <option key={p.id} value={p.id}>{p.name} (Tồn: {p.currentStock})</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1">Số lượng điều chỉnh:</label>
          <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-full border p-3 rounded-xl bg-slate-50" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button onClick={()=>apply('add')} className="bg-emerald-600 text-white py-3 rounded-xl font-black uppercase">Nhập bù</button>
          <button onClick={()=>apply('sub')} className="bg-red-600 text-white py-3 rounded-xl font-black uppercase">Xuất bù</button>
        </div>
      </div>
    </div>
  );
};

const HistoryTable = ({ data, onOpenDetail }) => {
  const all = [...(data.receipts || []), ...(data.issues || [])].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6 uppercase font-bold italic">
      <h2 className="text-2xl font-black">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs"><table className="w-full text-left font-sans tracking-widest"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Mã số</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày tháng</th><th className="px-6 py-4 text-center">Khóa</th></tr></thead>
      <tbody className="divide-y">{all.map(d => (<tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(d)}><td className="px-6 py-4 text-blue-600 font-mono">{d.code}</td><td className="px-6 py-4">{d.type}</td><td className="px-6 py-4">{d.date}</td><td className="px-6 py-4 text-center">{d.isLocked ? <Lock size={14} className="mx-auto text-red-500"/> : <X size={14} className="mx-auto text-slate-300"/>}</td></tr>))}</tbody></table></div>
    </div>
  );
};

// --- TÀI KHOẢN: HIỆN THÔNG TIN CHI TIẾT CHO ADMIN ---
const UserManagement = ({ data, setData }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'view' });
  const save = (e) => { e.preventDefault(); setData(prev => ({ ...prev, users: [...prev.users, { ...form, id: Date.now() }] })); setShowModal(false); };
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase">Quản lý Tài khoản phụ</h2><button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl">+ TẠO MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs"><table className="w-full text-left font-sans font-bold tracking-tighter"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Tên hiển thị</th><th className="px-6 py-4">Username</th><th className="px-6 py-4">Mật khẩu</th><th className="px-6 py-4">Vai trò</th><th className="px-6 py-4 text-center">Thao tác</th></tr></thead>
      <tbody className="divide-y">{(data.users || []).map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4">{u.name}</td><td className="px-6 py-4 font-mono text-blue-600">{u.username}</td><td className="px-6 py-4 font-mono">{u.password}</td><td className="px-6 py-4">{u.role}</td><td className="px-6 py-4 text-center"><button disabled={u.username==='admin'} onClick={()=>setData(p=>({...p, users:p.users.filter(x=>x.id!==u.id)}))} className="text-red-400 disabled:opacity-20"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showModal && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] backdrop-blur-sm"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative"><button type="button" onClick={()=>setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X/></button><h3 className="text-xl font-black uppercase italic border-b pb-2">Thêm tài khoản</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Họ tên cán bộ" required /><input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Tên đăng nhập" required /><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50" placeholder="Mật khẩu" required /><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold">{USER_ROLES.map(r=><option key={r.val} value={r.val}>{r.label}</option>)}</select><button className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold uppercase">Xác nhận tạo</button></form></div>}
    </div>
  );
};

const StaffManagement = ({ data, setData }) => {
  const [form, setForm] = useState({ role: 'Thủ kho', name: '', rank: 'Đại úy' });
  const saveStaff = () => { setData(prev => ({ ...prev, staff: [...(prev.staff || []), { ...form, id: Date.now() }] })); setForm({ role: 'Thủ kho', name: '', rank: 'Đại úy' }); };
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <h2 className="text-2xl font-black uppercase">Nhân sự ký duyệt</h2>
      <div className="bg-white p-6 rounded-2xl border flex gap-4 items-end font-sans tracking-normal text-xs italic">
        <div className="flex-1"><label>Họ tên</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded-lg outline-none" /></div>
        <div className="w-32"><label>Cấp bậc</label><select value={form.rank} onChange={e=>setForm({...form, rank:e.target.value})} className="w-full border p-2 rounded-lg outline-none">{RANKS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        <div className="w-40"><label>Chức vụ</label><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-2 rounded-lg outline-none">{POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        <button onClick={saveStaff} className="bg-blue-600 text-white p-2.5 rounded-lg px-6 font-black italic shadow-lg">THÊM</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold font-sans tracking-widest"><table className="w-full text-left"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Chức vụ</th><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{(data.staff || []).map(s => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-blue-600">{s.role}</td><td className="px-6 py-4">{s.rank} {s.name}</td><td className="px-6 py-4 text-center"><button onClick={()=>setData(p=>({...p, staff:p.staff.filter(x=>x.id!==s.id)}))} className="text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
    </div>
  );
};

const AuditManagement = ({ data }) => { return <div className="p-12 bg-white rounded-3xl border shadow-sm text-center font-bold italic uppercase tracking-widest text-slate-400">Hệ thống kiểm kê đồng bộ Zero line (M1)</div>; };

const PrintTemplate = ({ doc }) => {
  const total = (doc.items || []).reduce((s, i) => s + (i.qty * i.price), 0);
  return (
    <div className="font-serif text-black leading-tight p-2">
      <div className="grid grid-cols-2 text-sm mb-6">
        <div><p className="uppercase">Quân khu 4</p><p className="font-bold uppercase underline">Sư đoàn 968</p></div>
        <div className="text-right uppercase font-bold"><p>Mẫu số: SS14-QN10</p><p>Số: {doc.code}</p></div>
      </div>
      <h2 className="text-center text-xl font-bold uppercase mb-4 underline">PHIẾU {doc.type.toUpperCase()} KHO VẬT CHẤT</h2>
      <div className="text-[11px] mb-4 space-y-1">
        <p>Ngày tháng: {doc.date}</p>
        <p>Kho hàng: Kho Chính Pro</p>
      </div>
      <table className="w-full border-collapse border border-black text-[11px]">
        <thead><tr className="bg-slate-50">
            <th className="border border-black p-1">STT</th><th className="border border-black p-1 text-left">Tên hàng hóa, vật chất</th>
            <th className="border border-black p-1">ĐVT</th><th className="border border-black p-1">Số lượng</th>
            <th className="border border-black p-1 text-right">Đơn giá</th><th className="border border-black p-1 text-right">Thành tiền</th>
        </tr></thead>
        <tbody>
          {doc.items.map((it, idx) => (<tr key={idx}><td className="border border-black p-1 text-center">{idx+1}</td><td className="border border-black p-1">{it.name}</td><td className="border border-black p-1 text-center">{it.unit}</td><td className="border border-black p-1 text-center">{it.qty}</td><td className="border border-black p-1 text-right">{it.price.toLocaleString()}</td><td className="border border-black p-1 text-right">{(it.qty*it.price).toLocaleString()}</td></tr>))}
          <tr className="font-bold"><td colSpan="5" className="border border-black p-1 text-right uppercase">Tổng cộng:</td><td className="border border-black p-1 text-right">{total.toLocaleString()}đ</td></tr>
        </tbody>
      </table>
      <p className="mt-2 italic font-bold text-[12px]">Bằng chữ: {docSoTiengViet(total)}</p>
      <div className="mt-8 grid grid-cols-5 text-center text-[10px] uppercase font-bold gap-1 leading-normal italic">
        <div><p>Người lập</p><div className="h-10"></div><p>{doc.signers?.lập || '.........'}</p></div>
        <div><p>Người giao</p><div className="h-10"></div><p>{doc.signers?.giao || '.........'}</p></div>
        <div><p>Người nhận</p><div className="h-10"></div><p>{doc.signers?.nhận || '.........'}</p></div>
        <div><p>Trưởng ban</p><div className="h-10"></div><p>{doc.signers?.trưởng_ban || '.........'}</p></div>
        <div><p>Chủ nhiệm</p><div className="h-10"></div><p>{doc.signers?.chủ_nhiệm || '.........'}</p></div>
      </div>
    </div>
  );
};