import React, { useState, useEffect } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, UserCheck, Save, FileSpreadsheet, RefreshCw, AlertTriangle, Wifi, WifiOff, KeyRound
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CẤU HÌNH HỆ THỐNG ---
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

// --- HELPER FUNCTIONS ---
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
  users: [{ id: 1, username: 'admin', password: '123', role: 'admin', name: 'Quản trị viên' }],
  products: [], receipts: [], issues: [], logs: [], audits: [],
  staff: [{ id: 1, role: 'Thủ kho', name: 'Nguyễn Thị Nga', rank: 'Thiếu tá' }],
  adjustments: []
};

// --- MAIN APP ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPwdModal, setShowPwdModal] = useState(false);

  // Sync Logic
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    const init = async () => {
      const local = localStorage.getItem('w_manager_m1_final');
      if (local) setData(JSON.parse(local));
      if (navigator.onLine) {
        try {
          let { data: cloud } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
          if (cloud && cloud.content) {
            setData(prev => ({ ...prev, ...cloud.content }));
          }
        } catch (e) { console.error("Sync error", e); }
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('w_manager_m1_final', JSON.stringify(data));
      if (isOnline) {
        const t = setTimeout(() => {
          supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data });
        }, 2000);
        return () => clearTimeout(t);
      }
    }
  }, [data, isOnline, loading]);

  const addStockLog = (action, details = "") => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}`;
    const newLog = { 
        id: Date.now(), 
        action: `${timeStr} – ${currentUser?.name} – ${action}: ${details}`, 
        time: now.toLocaleString('vi-VN') 
    };
    setData(prev => ({ ...prev, logs: [newLog, ...(prev.logs || [])].slice(0, 500) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold italic text-slate-500">Đang khởi động hệ thống M1 (Offline mode)...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={e => { e.preventDefault(); const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password); if (u) { setCurrentUser(u); } else alert('Sai mật khẩu!'); }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6"><ShieldCheck className="text-blue-600 mx-auto mb-2" size={48} /><h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Warehouse Pro</h1></div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 font-bold outline-none" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase hover:bg-blue-600 transition-all">Đăng nhập</button>
        </form>
      </div>
    );
  }

  const canAccess = (tab) => {
    const r = currentUser.role;
    if (r === 'admin') return true;
    if (r === 'thukho') return ['dashboard', 'products', 'audit', 'staff', 'history', 'adjust', 'logs'].includes(tab);
    if (r === 'coquan') return ['dashboard', 'products', 'in', 'out', 'history'].includes(tab);
    if (r === 'view') return ['dashboard', 'products'].includes(tab);
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-6 flex flex-col gap-1 px-2 italic text-xl border-b border-slate-800 pb-4">
            <Activity className="inline text-blue-500 mr-2"/>W-MANAGER
            <span className={`text-[10px] not-italic font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-500' : 'text-orange-500'}`}>
                {isOnline ? <Wifi size={10}/> : <WifiOff size={10}/>} {isOnline ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}
            </span>
        </div>
        <nav className="space-y-1 flex-1 text-xs font-bold uppercase">
          {canAccess('dashboard') && <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo" />}
          {canAccess('products') && <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />}
          
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase font-black">Nghiệp vụ (M1)</div>
          {canAccess('in') && <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />}
          {canAccess('out') && <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />}
          {canAccess('adjust') && <NavBtn active={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} icon={RefreshCw} label="Điều chỉnh kho" />}
          {canAccess('history') && <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />}
          
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase font-black">Hệ thống</div>
          {canAccess('logs') && <NavBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={Activity} label="Nhật ký lệnh" />}
          {canAccess('staff') && <NavBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={UserCheck} label="Cán bộ ký" />}
          {canAccess('audit') && <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={ClipboardCheck} label="Kiểm kê" />}
          {currentUser.role === 'admin' && <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Tài khoản" />}
        </nav>
        <div className="border-t border-slate-800 pt-4 mt-4 space-y-2">
            <div className="px-3 text-[10px] text-blue-400 font-bold italic uppercase truncate">{currentUser.name}</div>
            <button onClick={() => setShowPwdModal(true)} className="text-slate-400 p-2 flex items-center gap-2 text-[10px] font-black w-full hover:bg-slate-800 rounded-lg transition-colors"><KeyRound size={14}/> ĐỔI MẬT KHẨU</button>
            <button onClick={() => setCurrentUser(null)} className="text-red-400 p-2 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={14}/> ĐĂNG XUẤT</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} user={currentUser} log={addStockLog} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} log={addStockLog} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} log={addStockLog} />}
        {activeTab === 'adjust' && <AdjustmentModule data={data} setData={setData} log={addStockLog} />}
        {activeTab === 'history' && <HistoryTable data={data} onOpenDetail={setSelectedDoc} />}
        {activeTab === 'logs' && <LogTable data={data} />}
        {activeTab === 'staff' && <StaffManagement data={data} setData={setData} />}
        {activeTab === 'audit' && <AuditManagement data={data} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} />}
      </main>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPwdModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[200] backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl relative">
                  <button onClick={()=>setShowPwdModal(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
                  <h3 className="text-lg font-black uppercase mb-4 italic">Đổi mật khẩu</h3>
                  <input id="new_p_val" type="text" className="w-full border p-3 rounded-xl font-bold mb-4 bg-slate-50" placeholder="Mật khẩu mới (chữ & số)" />
                  <button onClick={() => {
                      const val = document.getElementById('new_p_val').value;
                      if(val.length < 3) return alert("Mật khẩu quá ngắn!");
                      setData(prev => ({ ...prev, users: prev.users.map(u => u.id === currentUser.id ? {...u, password: val} : u) }));
                      setCurrentUser({...currentUser, password: val});
                      setShowPwdModal(false); alert("Đã cập nhật mật khẩu mới!");
                  }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase shadow-lg">Lưu mật khẩu</button>
              </div>
          </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8 shadow-2xl">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => { 
                setData(prev => ({
                  ...prev, 
                  [selectedDoc.type === 'Nhập' ? 'receipts' : 'issues']: prev[selectedDoc.type === 'Nhập' ? 'receipts' : 'issues'].map(d => d.id === selectedDoc.id ? {...d, isLocked: true} : d)
                }));
                window.print(); 
              }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg"><Printer size={18}/> IN & KHÓA</button>
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
  const totalValue = activeProducts.reduce((sum, p) => sum + (Number(p.bookStock || 0) * Number(p.price || 0)), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Tổng quan kho tàng</h2>
      <div className="grid grid-cols-2 gap-6 font-bold uppercase">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500"><Package size={30} className="text-blue-500"/><div><p className="text-[10px] text-slate-400">Số chủng loại</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div></div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500"><DollarSign size={30} className="text-emerald-500"/><div><p className="text-[10px] text-slate-400">Giá trị sổ sách</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div></div>
      </div>
    </div>
  );
};

const Products = ({ data, setData, user, log }) => {
  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });
  const isAdmin = user.role === 'admin' || user.role === 'thukho';
  const filtered = (data.products || []).filter(p => p.isActive && (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));

  const save = (e) => {
    e.preventDefault();
    const newP = { ...form, id: Date.now(), isActive: true, bookStock: 0, physicalStock: 0 };
    setData(prev => ({ ...prev, products: [...(prev.products || []), newP] }));
    log("Thêm hàng mới", `${newP.sku} - ${newP.name}`);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Danh mục vật chất</h2>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên hoặc mã..." className="pl-10 pr-4 py-2 rounded-xl border font-bold text-sm w-64 outline-none" /></div>
          {isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md">+ THÊM MỚI</button>}
        </div>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-[11px] font-bold uppercase italic">
        <table className="w-full text-left font-sans"><thead className="bg-slate-900 text-slate-400"><tr>
            <th className="px-6 py-4 w-16">STT</th><th className="px-6 py-4">Mã SKU</th><th className="px-6 py-4">Tên vật chất</th>
            <th className="px-6 py-4 text-center">Sổ sách</th><th className="px-6 py-4 text-center">Thực tế</th><th className="px-6 py-4 text-center">Lệch</th>
        </tr></thead>
        <tbody className="divide-y">{filtered.map((p, idx) => {
            const diff = Number(p.physicalStock || 0) - Number(p.bookStock || 0);
            return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td>
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4 text-center font-black">{p.bookStock} {p.unit}</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600 bg-emerald-50/30">{p.physicalStock} {p.unit}</td>
                    <td className={`px-6 py-4 text-center font-black ${diff !== 0 ? 'text-red-500' : 'text-slate-300'}`}>{diff > 0 ? `+${diff}` : diff}</td>
                </tr>
            )})}</tbody></table>
      </div>
      {showForm && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative"><button type="button" onClick={()=>setShowForm(false)} className="absolute top-4 right-4 text-slate-400"><X/></button><h3 className="text-xl font-black italic border-b pb-2 uppercase">Thêm vật chất mới</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl font-bold" placeholder="Tên hàng" required /><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl font-mono" placeholder="Mã SKU" required /><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl font-bold" placeholder="Đơn giá" required /><button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase shadow-lg">Lưu vào danh mục</button></form></div>}
    </div>
  );
};

const Transaction = ({ type, data, setData, log }) => {
  const [cart, setCart] = useState([]);
  const [q, setQ] = useState('');
  const [signers, setSigners] = useState({ lập: '', giao: '', nhận: '', trưởng_ban: '', chủ_nhiệm: '' });
  const products = (data.products || []).filter(p => p.isActive && (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));

  const save = () => {
    if (!cart.length) return alert("Giỏ hàng trống!");
    if (type === 'out') {
        for (let item of cart) {
            const p = data.products.find(x => x.id === item.id);
            if (Number(item.qty) > Number(p.bookStock)) {
                alert(`LỖI: "${item.name}" tồn kho ${p.bookStock}. Không thể xuất ${item.qty}!`);
                return;
            }
        }
    }

    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => { 
          const i = cart.find(x => x.id === p.id); if(!i) return p;
          const nv = type === 'in' ? Number(p.bookStock) + Number(i.qty) : Number(p.bookStock) - Number(i.qty);
          return { ...p, bookStock: nv, physicalStock: nv }; 
      }),
      [type === 'in' ? 'receipts' : 'issues']: [{ id: Date.now(), type: type==='in'?'Nhập':'Xuất', code, date: new Date().toLocaleString(), items: [...cart], isLocked: false, signers }, ...(prev[type === 'in' ? 'receipts' : 'issues'] || [])]
    }));

    cart.forEach(i => {
        const p = data.products.find(x => x.id === i.id);
        const oldV = Number(p.bookStock);
        const newV = type === 'in' ? oldV + Number(i.qty) : oldV - Number(i.qty);
        log(`${type==='in'?'Nhập':'Xuất'} (Phiếu ${code})`, `${i.sku}: ${oldV} → ${newV}`);
    });
    setCart([]); alert("Lưu phiếu thành công!");
  };

  return (
    <div className="grid grid-cols-2 gap-8 uppercase font-bold italic h-[calc(100vh-160px)]">
      <div className="bg-white border rounded-3xl overflow-y-auto divide-y shadow-sm flex flex-col">
        <div className="p-4 bg-slate-50 border-b flex gap-2"><div className="relative flex-1 font-sans italic tracking-normal"><Search className="absolute left-3 top-2.5 text-slate-400" size={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm nhanh..." className="w-full pl-8 pr-4 py-2 rounded-lg border outline-none font-bold" /></div></div>
        <div className="flex-1 overflow-y-auto divide-y">{products.map(p => (<button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center"><div><p>{p.name}</p><p className="text-[10px] text-slate-400 font-sans italic">{p.sku}</p></div><span className="text-blue-600 font-mono">{p.bookStock}</span></button>))}</div>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl flex flex-col space-y-4">
        <h3 className="text-blue-400 border-b border-slate-800 pb-2 text-[10px] uppercase">Thành phần ký duyệt đầy đủ</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
            <select className="bg-slate-800 p-2 rounded border border-slate-700" value={signers.lập} onChange={e=>setSigners({...signers, lập:e.target.value})}><option value="">-- Người lập phiếu --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700" value={signers.giao} onChange={e=>setSigners({...signers, giao:e.target.value})}><option value="">-- Người giao hàng --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700" value={signers.nhận} onChange={e=>setSigners({...signers, nhận:e.target.value})}><option value="">-- Người nhận hàng --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700" value={signers.trưởng_ban} onChange={e=>setSigners({...signers, trưởng_ban:e.target.value})}><option value="">-- Trưởng ban --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded border border-slate-700 col-span-2" value={signers.chủ_nhiệm} onChange={e=>setSigners({...signers, chủ_nhiệm:e.target.value})}><option value="">-- Chủ nhiệm --</option>{data.staff.map(s=><option key={s.id} value={s.rank+' '+s.name}>{s.rank+' '+s.name}</option>)}</select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 border-t border-slate-800 pt-4 scrollbar-hide">
          {cart.map((i, idx) => (<div key={idx} className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 items-center"><span>{i.name}</span><div className="flex gap-3 items-center"><input type="number" className="w-12 bg-transparent text-center border-b border-slate-600 outline-none font-bold" value={i.qty} onChange={e=>{const n=[...cart]; n[idx].qty=Number(e.target.value); setCart(n);}} /><button onClick={()=>setCart(cart.filter((_,j)=>j!==idx))} className="text-red-500 p-1 rounded"><Trash2 size={14}/></button></div></div>))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-blue-500 transition-all">Xác nhận lưu hệ thống</button>
      </div>
    </div>
  );
};

const AdjustmentModule = ({ data, setData, log }) => {
    const [cart, setCart] = useState([]);
    const [q, setQ] = useState('');
    const [mode, setMode] = useState('add'); 
    const products = (data.products || []).filter(p => p.isActive && (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));

    const saveAdj = () => {
        if (!cart.length) return alert("Chưa chọn vật chất!");
        if (mode === 'sub') {
            for (let item of cart) {
                const p = data.products.find(x => x.id === item.id);
                if (Number(item.qty) > Number(p.physicalStock)) {
                    alert(`LỖI: "${item.name}" thực tế còn ${p.physicalStock}. Không thể trừ ${item.qty}!`);
                    return;
                }
            }
        }
        setData(prev => ({
            ...prev,
            products: prev.products.map(p => {
                const i = cart.find(x => x.id === p.id); if (!i) return p;
                const nv = mode === 'add' ? Number(p.physicalStock) + Number(i.qty) : Number(p.physicalStock) - Number(i.qty);
                return { ...p, physicalStock: nv };
            }),
            adjustments: [{ id: Date.now(), date: new Date().toLocaleString(), type: mode === 'add' ? 'Nhập bù' : 'Xuất bù', items: [...cart] }, ...(prev.adjustments || [])]
        }));
        cart.forEach(i => {
            const p = data.products.find(x => x.id === i.id);
            const oldP = Number(p.physicalStock);
            const newP = mode === 'add' ? oldP + Number(i.qty) : oldP - Number(i.qty);
            log(`Điều chỉnh (${mode==='add'?'Nhập bù':'Xuất bù'})`, `${i.sku}: ${oldP} → ${newP}`);
        });
        setCart([]); alert("Đã cập nhật tồn thực tế!");
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)] uppercase font-bold italic">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic text-orange-600 flex items-center gap-2"><RefreshCw/> Điều chỉnh kho</h2>
                <div className="flex bg-white p-1 rounded-xl border shadow-sm">
                    <button onClick={()=>setMode('add')} className={`px-6 py-2 rounded-lg transition-all ${mode==='add'?'bg-emerald-600 text-white shadow-md':'text-slate-400'}`}>NHẬP BÙ</button>
                    <button onClick={()=>setMode('sub')} className={`px-6 py-2 rounded-lg transition-all ${mode==='sub'?'bg-red-600 text-white shadow-md':'text-slate-400'}`}>XUẤT BÙ</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden">
                <div className="bg-white border rounded-3xl overflow-y-auto divide-y shadow-sm flex flex-col">
                    <div className="p-4 bg-slate-50 border-b flex gap-2 font-sans italic tracking-normal"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm..." className="w-full pl-8 pr-4 py-2 rounded-lg border outline-none font-bold" /></div></div>
                    <div className="flex-1 overflow-y-auto divide-y">{products.map(p => (<button key={p.id} onClick={() => setCart([...cart, {...p, qty: 1}])} className="w-full text-left p-4 hover:bg-orange-50 flex justify-between items-center"><div><p>{p.name}</p><p className="text-[10px] text-slate-400 font-sans">{p.sku}</p></div><span className="text-orange-600 font-mono">Thực: {p.physicalStock}</span></button>))}</div>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col flex-1 overflow-hidden shadow-2xl">
                    <h3 className="text-orange-400 border-b border-slate-800 pb-2 text-[10px] uppercase">D/S Thay đổi thực tồn</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 mt-4 pr-2 scrollbar-hide font-sans">
                        {cart.map((i, idx) => (<div key={idx} className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 items-center"><span>{i.name}</span><div className="flex gap-3 items-center"><input type="number" className="w-12 bg-transparent text-center border-b border-slate-600 outline-none" value={i.qty} onChange={e=>{const n=[...cart]; n[idx].qty=Number(e.target.value); setCart(n);}} /><button onClick={()=>setCart(cart.filter((_,j)=>j!==idx))} className="text-red-500 p-1 rounded"><Trash2 size={14}/></button></div></div>))}
                    </div>
                    <button onClick={saveAdj} className={`w-full py-4 rounded-2xl font-black uppercase mt-6 shadow-lg ${mode==='add'?'bg-emerald-600':'bg-red-600'}`}>Cập nhật</button>
                </div>
            </div>
        </div>
    );
};

const HistoryTable = ({ data, onOpenDetail }) => {
  const all = [...(data.receipts || []), ...(data.issues || [])].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6 uppercase font-bold italic">
      <h2 className="text-2xl font-black uppercase">Lịch sử phiếu Nhập/Xuất</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs"><table className="w-full text-left font-sans font-bold"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Mã số</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày tháng</th><th className="px-6 py-4 text-center">Trạng thái</th></tr></thead>
      <tbody className="divide-y">{all.map(d => (<tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(d)}><td className="px-6 py-4 text-blue-600 font-mono">{d.code}</td><td className="px-6 py-4">{d.type}</td><td className="px-6 py-4">{d.date}</td><td className="px-6 py-4 text-center">{d.isLocked ? <div className="text-red-500 flex items-center justify-center gap-1"><Lock size={12}/> Đã khóa</div> : <div className="text-slate-300">Chưa khóa</div>}</td></tr>))}</tbody></table></div>
    </div>
  );
};

const LogTable = ({ data }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-2"><Activity className="text-blue-600"/> Nhật ký biến động kho</h2>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-[11px] font-bold italic">
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-2">
                {(data.logs || []).map(log => (
                    <div key={log.id} className="p-3 border-l-4 border-blue-500 bg-slate-50 flex justify-between items-center rounded-r-lg shadow-sm">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-sans tracking-normal not-italic">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const UserManagement = ({ data, setData }) => {
  const [showM, setShowM] = useState(false);
  const [f, setF] = useState({ username: '', password: '', name: '', role: 'view' });
  const save = (e) => { e.preventDefault(); setData(prev => ({ ...prev, users: [...prev.users, { ...f, id: Date.now() }] })); setShowM(false); };
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase">Cán bộ hệ thống</h2><button onClick={() => setShowM(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-all hover:bg-blue-700 shadow-md">+ TẠO MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs"><table className="w-full text-left font-sans font-bold font-sans"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4">Username</th><th className="px-6 py-4">Password</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{(data.users || []).map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4 uppercase">{u.name}</td><td className="px-6 py-4 text-blue-600 lowercase">{u.username}</td><td className="px-6 py-4">{u.password}</td><td className="px-6 py-4 text-center"><button disabled={u.username==='admin'} onClick={()=>setData(p=>({...p, users:p.users.filter(x=>x.id!==u.id)}))} className="text-red-400 disabled:opacity-10"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showM && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative"><button type="button" onClick={()=>setShowM(false)} className="absolute top-4 right-4 text-slate-400"><X/></button><h3 className="text-xl font-black uppercase border-b pb-2">Tạo tài khoản</h3><input value={f.name} onChange={e=>setF({...f, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Họ tên" required /><input value={f.username} onChange={e=>setF({...f, username:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Tên đăng nhập" required /><input value={f.password} onChange={e=>setF({...f, password:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Mật khẩu" required /><select value={f.role} onChange={e=>setF({...f, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50">{USER_ROLES.map(r=><option key={r.val} value={r.val}>{r.label}</option>)}</select><button className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold uppercase">Xác nhận</button></form></div>}
    </div>
  );
};

const StaffManagement = ({ data, setData }) => {
  const [f, setF] = useState({ role: 'Thủ kho', name: '', rank: 'Đại úy' });
  const save = () => { setData(p => ({ ...p, staff: [...(p.staff || []), { ...f, id: Date.now() }] })); };
  return (
    <div className="space-y-6 font-bold uppercase italic">
      <h2 className="text-2xl font-black uppercase italic">Nhân sự ký duyệt</h2>
      <div className="bg-white p-6 rounded-2xl border flex gap-4 items-end font-sans italic text-xs">
        <div className="flex-1"><label>Họ tên</label><input value={f.name} onChange={e=>setF({...f, name:e.target.value})} className="w-full border p-2 rounded-lg outline-none" /></div>
        <div className="w-32"><label>Cấp bậc</label><select value={f.rank} onChange={e=>setF({...f, rank:e.target.value})} className="w-full border p-2 rounded-lg">{RANKS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        <div className="w-40"><label>Chức vụ</label><select value={f.role} onChange={e=>setF({...f, role:e.target.value})} className="w-full border p-2 rounded-lg">{POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
        <button onClick={save} className="bg-blue-600 text-white p-2.5 rounded-lg px-6 font-black shadow-lg">THÊM</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold font-sans tracking-widest"><table className="w-full text-left font-bold uppercase"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Chức vụ</th><th className="px-6 py-4">Họ tên</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{(data.staff || []).map(s => (<tr key={s.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-blue-600">{s.role}</td><td className="px-6 py-4">{s.rank} {s.name}</td><td className="px-6 py-4 text-center"><button onClick={()=>setData(p=>({...p, staff:p.staff.filter(x=>x.id!==s.id)}))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
    </div>
  );
};

const AuditManagement = ({ data }) => { 
    return <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border shadow-sm text-center">
        <AlertTriangle size={60} className="text-orange-400 mb-4 animate-pulse"/>
        <h3 className="text-2xl font-black italic uppercase text-slate-800">Kiểm kê Zero Line (M1)</h3>
        <p className="text-slate-400 mt-2 font-bold italic text-[10px]">Đang tổng hợp báo cáo đối chiếu Sổ sách & Thực tế...</p>
    </div>; 
};

const PrintTemplate = ({ doc }) => {
  const total = (doc.items || []).reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
  return (
    <div className="font-serif text-black leading-tight p-2">
      <div className="grid grid-cols-2 text-[12px] mb-6 uppercase">
        <div><p>Quân khu 4</p><p className="font-bold underline">Sư đoàn 968</p></div>
        <div className="text-right font-bold"><p>Mẫu số: SS14-QN10</p><p>Số: {doc.code}</p></div>
      </div>
      <h2 className="text-center text-xl font-bold uppercase mb-4 underline italic">PHIẾU {doc.type.toUpperCase()} KHO VẬT CHẤT</h2>
      <div className="text-[11px] mb-4 space-y-1 italic">
        <p>Ngày lập phiếu: {doc.date}</p>
        <p>Địa điểm: Kho Chính - Sư đoàn 968</p>
      </div>
      <table className="w-full border-collapse border border-black text-[11px]">
        <thead><tr className="bg-slate-50 uppercase font-bold">
            <th className="border border-black p-1">STT</th><th className="border border-black p-1 text-left">Tên vật chất, khí tài</th>
            <th className="border border-black p-1">ĐVT</th><th className="border border-black p-1">S.Lượng</th>
            <th className="border border-black p-1 text-right">Đơn giá</th><th className="border border-black p-1 text-right">Thành tiền</th>
        </tr></thead>
        <tbody>
          {doc.items.map((it, idx) => (<tr key={idx}><td className="border border-black p-1 text-center">{idx+1}</td><td className="border border-black p-1">{it.name}</td><td className="border border-black p-1 text-center">{it.unit}</td><td className="border border-black p-1 text-center">{it.qty}</td><td className="border border-black p-1 text-right">{it.price.toLocaleString()}</td><td className="border border-black p-1 text-right">{(it.qty*it.price).toLocaleString()}</td></tr>))}
          <tr className="font-bold"><td colSpan="5" className="border border-black p-1 text-right uppercase">Tổng cộng:</td><td className="border border-black p-1 text-right">{total.toLocaleString()}đ</td></tr>
        </tbody>
      </table>
      <p className="mt-2 italic font-bold text-[12px]">Bằng chữ: {docSoTiengViet(total)}</p>
      <div className="mt-8 grid grid-cols-5 text-center text-[9px] uppercase font-bold gap-1 leading-tight italic">
        <div><p>Người lập phiếu</p><div className="h-10"></div><p className="underline">{doc.signers?.lập || '.........'}</p></div>
        <div><p>Người giao hàng</p><div className="h-10"></div><p className="underline">{doc.signers?.giao || '.........'}</p></div>
        <div><p>Người nhận hàng</p><div className="h-10"></div><p className="underline">{doc.signers?.nhận || '.........'}</p></div>
        <div><p>Trưởng ban</p><div className="h-10"></div><p className="underline">{doc.signers?.trưởng_ban || '.........'}</p></div>
        <div><p>Chủ nhiệm</p><div className="h-10"></div><p className="underline">{doc.signers?.chủ_nhiệm || '.........'}</p></div>
      </div>
    </div>
  );
};