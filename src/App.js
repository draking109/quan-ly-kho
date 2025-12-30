import React, { useState, useEffect } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, UserCheck, Save, FileSpreadsheet
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CẤU HÌNH ---
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

// Hàm xuất Excel XML (Hỗ trợ tốt nhất cho Excel)
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
        <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-xl transition-colors"><LogOut size={14}/> ĐĂNG XUẤT</button>
      </aside>

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

const Dashboard = ({ data }) => {
  const activeProducts = (data.products || []).filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Tổng quan kho tàng</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><Package size={30} className="text-blue-500"/><div><p className="text-xs text-slate-400 font-bold uppercase">Chủng loại</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div></div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><DollarSign size={30} className="text-emerald-500"/><div><p className="text-xs text-slate-400 font-bold uppercase">Tổng giá trị</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div></div>
      </div>
    </div>
  );
};

const Products = ({ data, setData, log, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });
  const isAdmin = user.role === 'admin';
  const save = (e) => { e.preventDefault(); setData(prev => ({ ...prev, products: [...(prev.products || []), { ...form, id: Date.now(), isActive: true, currentStock: 0 }] })); setShowForm(false); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Danh mục vật chất</h2><div className="flex gap-2">
        <button onClick={() => {
          const headers = ["Mã SKU", "Tên vật chất", "Đơn vị", "Đơn giá", "Tồn kho"];
          const rows = (data.products || []).filter(p=>p.isActive).map(p => [p.sku, p.name, p.unit, p.price, p.currentStock]);
          exportToExcel("DanhMuc_HangHoa", "HangHoa", headers, rows);
        }} className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"><FileSpreadsheet size={18}/> EXCEL</button>
        {isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg">+ THÊM MỚI</button>}
      </div></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left text-xs font-bold uppercase"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Mã SKU</th><th className="px-6 py-4">Tên vật chất</th><th className="px-6 py-4 text-center">Tồn kho</th></tr></thead>
      <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td></tr>))}</tbody></table></div>
      {showForm && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110]"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4"><h3 className="text-xl font-black italic border-b pb-2">THÊM VẬT CHẤT</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold" placeholder="Tên vật chất" required /><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl font-mono" placeholder="Mã SKU" required /><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl font-bold" placeholder="Đơn giá" required /><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">LƯU LẠI</button></form></div>}
    </div>
  );
};

const Transaction = ({ type, data, setData, user, log }) => {
  const [cart, setCart] = useState([]);
  const save = () => {
    if (!cart.length) return alert("Chưa chọn hàng!");
    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    const newDoc = { id: Date.now(), type: type==='in'?'Nhập':'Xuất', code, date: new Date().toLocaleString(), items: [...cart], isLocked: false, source: '', refCode: '', signers: {} };
    setData(prev => ({ ...prev, 
      products: prev.products.map(p => { const i = cart.find(x => x.id === p.id); return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p; }),
      [type === 'in' ? 'receipts' : 'issues']: [newDoc, ...(prev[type === 'in' ? 'receipts' : 'issues'] || [])]
    }));
    setCart([]); alert("Thành công!");
  };
  return (
    <div className="grid grid-cols-2 gap-8 uppercase font-bold">
      <div className="bg-white border rounded-3xl h-[500px] overflow-y-auto divide-y shadow-sm">
        {(data.products || []).filter(p => p.isActive).map(p => (<button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between"><span>{p.name}</span><span className="text-blue-500">+{p.currentStock}</span></button>))}
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
        <h3 className="text-blue-400 mb-6 border-b border-slate-800 pb-4 text-xs font-black uppercase">GIỎ HÀNG {type === 'in' ? 'NHẬP' : 'XUẤT'}</h3>
        <div className="space-y-2 mb-6 h-64 overflow-y-auto">
          {cart.map((i, idx) => (<div key={idx} className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700"><span>{i.name}</span><div className="flex gap-2"><span>x{i.qty}</span><button onClick={()=>setCart(cart.filter((_,j)=>j!==idx))} className="text-red-500">X</button></div></div>))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase hover:bg-blue-500">XÁC NHẬN LƯU PHIẾU</button>
      </div>
    </div>
  );
};

const HistoryTable = ({ data, onOpenDetail }) => {
  const all = [...(data.receipts || []).map(r => ({...r, type: 'Nhập'})), ...(data.issues || []).map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6 uppercase font-bold italic">
      <h2 className="text-2xl font-black">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs"><table className="w-full text-left font-sans"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4 text-center">Trạng thái</th></tr></thead>
      <tbody className="divide-y">{all.map(d => (<tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(d)}><td className="px-6 py-4 text-blue-600 font-mono">{d.code} - {d.type}</td><td className="px-6 py-4 text-center">{d.isLocked ? "ĐÃ KHÓA" : "CHƯA KHÓA"}</td></tr>))}</tbody></table></div>
    </div>
  );
};

const StaffManagement = ({ data, setData }) => {
  const [name, setName] = useState('');
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <h2 className="text-2xl font-black">Cán bộ ký duyệt</h2>
      <div className="bg-white p-6 rounded-2xl border flex gap-4">
        <input value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded-lg font-bold flex-1" placeholder="Họ tên cán bộ" />
        <button onClick={()=>{setData(prev=>({...prev, staff:[...(prev.staff||[]), {id:Date.now(), name, role:'Thủ kho', rank:'Đại úy'}]})); setName('')}} className="bg-blue-600 text-white px-6 rounded-lg font-bold">THÊM</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden font-sans"><table className="w-full text-left text-xs uppercase font-bold"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Họ và tên</th><th className="px-6 py-4">Chức danh</th></tr></thead>
      <tbody className="divide-y">{(data.staff || []).map(s=>(<tr key={s.id} className="hover:bg-slate-50"><td className="px-6 py-4">{s.name}</td><td className="px-6 py-4">{s.role}</td></tr>))}</tbody></table></div>
    </div>
  );
};

const AuditManagement = ({ data, setData }) => (
  <div className="bg-white p-8 rounded-3xl border shadow-sm text-center italic font-bold">Hệ thống kiểm kê đang được đồng bộ cho Zero line M1...</div>
);

const UserManagement = ({ data, setData }) => (
  <div className="bg-white p-8 rounded-3xl border shadow-sm text-center italic font-bold">Quản lý người dùng nâng cao (Dành cho Admin)</div>
);

const PrintTemplate = ({ doc }) => {
  const totalAmount = (doc.items || []).reduce((sum, i) => sum + (i.qty * i.price), 0);
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`@media print { .no-print { display: none !important; } } .print-table th, .print-table td { border: 1px solid black; padding: 5px; } .print-table { border-collapse: collapse; width: 100%; margin-top: 15px; }`}</style>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase">PHIẾU {doc.type} KHO VẬT CHẤT</h2>
        <p className="text-sm">Mã số: {doc.code}</p>
      </div>
      <table className="print-table text-[12px] text-center">
        <thead><tr className="font-bold"><th>TT</th><th>Tên hàng</th><th>ĐVT</th><th>Số lượng</th><th>Thành tiền</th></tr></thead>
        <tbody>
          {(doc.items || []).map((item, idx) => (
            <tr key={idx}><td>{idx + 1}</td><td className="text-left">{item.name}</td><td>{item.unit}</td><td>{item.qty}</td><td className="text-right">{(item.qty * item.price).toLocaleString()}</td></tr>
          ))}
          <tr className="font-bold"><td colSpan="4" className="text-right uppercase">Tổng cộng:</td><td className="text-right">{totalAmount.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <p className="mt-4 italic font-bold">Bằng chữ: {docSoTiengViet(totalAmount)}</p>
      <div className="mt-10 grid grid-cols-3 text-center text-xs uppercase font-bold">
        <div><p>Người lập</p><div className="h-12"></div><p>Nguyễn Lê Nhật Ký</p></div>
        <div><p>Thủ kho</p><div className="h-12"></div><p>Nguyễn Thị Nga</p></div>
        <div><p>Trưởng ban</p><div className="h-12"></div><p>Phạm Ngọc Hầu</p></div>
      </div>
    </div>
  );
};