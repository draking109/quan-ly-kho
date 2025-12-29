import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, Wifi, WifiOff, UserCheck
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/* ================== CẤU HÌNH & TIỆN ÍCH ================== */
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);
const STORE_ID = "kho_chinh_pro_001"; 

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
  products: [],
  receipts: [],
  issues: [],
  logs: [],
  audits: [],
  staff: [
    { id: 1, role: 'Người lập', name: 'Nguyễn Lê Nhật Ký', rank: 'Đại úy' },
    { id: 2, role: 'Thủ kho', name: 'Nguyễn Thị Nga', rank: 'Thiếu tá' },
    { id: 3, role: 'Trưởng ban', name: 'Trương Văn Diện', rank: 'Trung tá' },
    { id: 4, role: 'Chủ nhiệm', name: 'Phạm Ngọc Hầu', rank: 'Thượng tá' }
  ]
};

/* ================== COMPONENT CHÍNH ================== */
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
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        let { data: cloud } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
        if (cloud && cloud.content) {
          // FIX: Trộn dữ liệu cũ với cấu trúc mới để tránh lỗi undefined
          setData({
            ...initialData,
            ...cloud.content,
            staff: cloud.content.staff || initialData.staff,
            logs: cloud.content.logs || [],
            audits: cloud.content.audits || []
          });
        } else {
          await supabase.from('warehouse_data').insert({ store_id: STORE_ID, content: initialData });
        }
      } catch (e) {
        console.error("Lỗi load data:", e);
      } finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (isOnline) {
        const t = setTimeout(async () => { await supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data }); }, 1000);
        return () => clearTimeout(t);
      }
    }
  }, [data, loading, isOnline]);

  const addSystemLog = (action) => {
    const newLog = { id: Date.now(), user: currentUser?.name || 'Hệ thống', action, time: new Date().toLocaleString('vi-VN') };
    setData(prev => ({ ...prev, logs: [newLog, ...(prev.logs || [])].slice(0, 200) }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold italic text-slate-500">Đang khởi động hệ thống...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form onSubmit={e => { e.preventDefault(); const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password); if (u) { setCurrentUser(u); addSystemLog('Đăng nhập'); } else alert('Sai tài khoản!'); }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <div className="text-center mb-6"><ShieldCheck className="text-blue-600 mx-auto mb-2" size={48} /><h1 className="text-2xl font-black uppercase italic tracking-tighter">Warehouse Pro V2</h1></div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 outline-none font-bold" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 outline-none font-bold" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase hover:bg-blue-600 transition-all">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-8 flex flex-col gap-1 px-2 italic">
          <span className="text-xl flex items-center gap-2"><Activity className="text-blue-500"/> W-MANAGER</span>
          <span className="text-[9px] uppercase tracking-tighter">{isOnline ? '● Trực tuyến' : '○ Ngoại tuyến'}</span>
        </div>
        <nav className="space-y-1 flex-1 text-xs font-bold uppercase tracking-tighter">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase">Giao dịch</div>
          <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
          <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử" />
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest uppercase">Hệ thống</div>
          <NavBtn active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={UserCheck} label="Cán bộ ký" />
          <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={ClipboardCheck} label="Kiểm kê" />
          {currentUser.role === 'admin' && <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Tài khoản" />}
        </nav>
        <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-xl mt-4"><LogOut size={14}/> ĐĂNG XUẤT</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'history' && <HistoryTable data={data} setData={setData} onOpenDetail={setSelectedDoc} log={addSystemLog} />}
        {activeTab === 'staff' && <StaffManagement data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'audit' && <AuditManagement data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} log={addSystemLog} />}
      </main>

      {/* Printer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8 shadow-2xl">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => { 
                if(!selectedDoc.isLocked) {
                  const listKey = selectedDoc.type === 'Nhập' ? 'receipts' : 'issues';
                  setData(prev => ({...prev, [listKey]: (prev[listKey] || []).map(d => d.id === selectedDoc.id ? {...d, isLocked: true} : d)}));
                }
                window.print(); 
              }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"><Printer size={18}/> IN & KHÓA</button>
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

/* ================== STAFF (Quản lý danh bạ cán bộ) ================== */
const StaffManagement = ({ data, setData, log }) => {
  const [form, setForm] = useState({ role: 'Người lập', name: '', rank: 'Đại úy' });
  const roles = ['Người lập', 'Người giao/nhận', 'Thủ kho', 'Trưởng ban', 'Chủ nhiệm'];

  const addStaff = () => {
    if(!form.name) return;
    setData(prev => ({ ...prev, staff: [...(prev.staff || []), { ...form, id: Date.now() }] }));
    log(`Thêm cán bộ: ${form.name}`);
    setForm({ ...form, name: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black uppercase italic">Danh bạ cán bộ ký duyệt</h2>
      <div className="bg-white p-6 rounded-2xl border shadow-sm grid grid-cols-4 gap-4 items-end font-bold text-[11px]">
        <div><label className="text-slate-400 block mb-1 uppercase tracking-widest">Vị trí mẫu</label><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50">{roles.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
        <div><label className="text-slate-400 block mb-1 uppercase tracking-widest">Cấp bậc</label><input value={form.rank} onChange={e=>setForm({...form, rank:e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
        <div><label className="text-slate-400 block mb-1 uppercase tracking-widest">Họ và tên</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50" placeholder="Nguyễn Văn A" /></div>
        <button onClick={addStaff} className="bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors tracking-widest uppercase text-[10px]">Lưu cán bộ</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs font-bold uppercase tracking-tighter">
          <thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-3">Vị trí</th><th className="px-6 py-3">Cấp bậc</th><th className="px-6 py-3">Họ và tên</th><th className="px-6 py-3 text-center">Xóa</th></tr></thead>
          <tbody className="divide-y">
            {(data.staff || []).map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-blue-600">{s.role}</td>
                <td className="px-6 py-3 italic">{s.rank}</td>
                <td className="px-6 py-3 text-slate-800">{s.name}</td>
                <td className="px-6 py-3 text-center"><button onClick={()=>{setData(prev=>({...prev, staff: (prev.staff || []).filter(x=>x.id!==s.id)})); log(`Xóa cán bộ: ${s.name}`)}} className="text-red-400"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================== TRANSACTION (Lập phiếu) ================== */
const Transaction = ({ type, data, setData, user, log }) => {
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' });
  
  // Tự động gán cán bộ mặc định từ danh bạ
  const [signers, setSigners] = useState({
    maker: { name: user.name, rank: 'Đại úy' },
    receiver: { name: '', rank: '' },
    keeper: (data.staff || []).find(s=>s.role==='Thủ kho') || { name: '', rank: '' },
    chief: (data.staff || []).find(s=>s.role==='Trưởng ban') || { name: '', rank: '' },
    manager: (data.staff || []).find(s=>s.role==='Chủ nhiệm') || { name: '', rank: '' }
  });

  const save = () => {
    if (!cart.length) return alert("Chưa có hàng!");
    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    const newDoc = {
      id: Date.now(), type: type === 'in' ? 'Nhập' : 'Xuất',
      code, date: new Date().toLocaleString('vi-VN'), items: [...cart], isLocked: false, ...info, signers
    };
    setData(prev => ({
      ...prev,
      products: (prev.products || []).map(p => { const i = cart.find(x => x.id === p.id); return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p; }),
      [type === 'in' ? 'receipts' : 'issues']: [newDoc, ...(prev[type === 'in' ? 'receipts' : 'issues'] || [])]
    }));
    log(`Lập phiếu: ${code}`); setCart([]); alert("Đã lưu phiếu!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold uppercase tracking-tighter animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black mb-6 italic">{type==='in'?'Nhập kho':'Xuất kho'}</h2>
        <div className="bg-white border rounded-3xl h-[400px] overflow-y-auto divide-y shadow-sm">
          {(data.products || []).filter(p => p.isActive).map(p => (
            <button key={p.id} onClick={() => { const ex = cart.find(x => x.id === p.id); if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x)); else setCart([...cart, {...p, qty: 1}]); }} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center group">
              <div><span className="text-slate-800 block">{p.name}</span><span className="text-[10px] text-slate-400">Tồn: {p.currentStock} {p.unit}</span></div>
              <Plus size={18} className="text-blue-500 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        <div className="mt-6 bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h3 className="text-[10px] text-blue-600 border-b pb-2 tracking-widest">KÝ PHIẾU (CHỌN NHANH)</h3>
          <div className="grid grid-cols-2 gap-4">
            <SignerSelect label="Thủ kho" list={(data.staff || []).filter(s=>s.role==='Thủ kho')} value={signers.keeper} onChange={val=>setSigners({...signers, keeper: val})} />
            <SignerSelect label="Trưởng ban" list={(data.staff || []).filter(s=>s.role==='Trưởng ban')} value={signers.chief} onChange={val=>setSigners({...signers, chief: val})} />
            <SignerSelect label="Chủ nhiệm" list={(data.staff || []).filter(s=>s.role==='Chủ nhiệm')} value={signers.manager} onChange={val=>setSigners({...signers, manager: val})} />
            <div><label className="text-[9px] text-slate-400 block mb-1">{type==='in'?'Người giao':'Người nhận'}</label>
            <input value={signers.receiver.name} onChange={e=>setSigners({...signers, receiver: {name: e.target.value, rank: ''}})} className="w-full border p-2 rounded-lg bg-slate-50 text-[11px] outline-none border-blue-100 focus:border-blue-400" placeholder="Tự điền tên..." /></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl h-fit border border-slate-800">
        <h3 className="text-blue-400 mb-6 border-b border-slate-800 pb-4 tracking-[3px] text-xs font-black">XÁC NHẬN NỘI DUNG</h3>
        <div className="space-y-4 mb-6">
          <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none" placeholder={type==='in'?'Nguồn nhập...':'Nơi nhận...'} value={info.source} onChange={e=>setInfo({...info, source:e.target.value})} />
          <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none text-xs" placeholder="Mã lệnh/Số hiệu" value={info.refCode} onChange={e=>setInfo({...info, refCode:e.target.value})} />
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto mb-6">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800 animate-in slide-in-from-right duration-300">
              <span className="text-[10px] truncate w-32 font-black">{i.name}</span>
              <div className="flex items-center gap-3">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-12 bg-slate-900 border-none rounded p-1 text-center font-black text-blue-400 text-xs" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 py-4 rounded-2xl font-black shadow-lg shadow-blue-900/40 uppercase tracking-widest text-sm hover:bg-blue-500 transition-all">Ghi phiếu & Trừ kho</button>
      </div>
    </div>
  );
};

const SignerSelect = ({ label, list, value, onChange }) => (
  <div>
    <label className="text-[9px] text-slate-400 block mb-1 uppercase tracking-widest">{label}</label>
    <select 
      value={value?.name || ''} 
      onChange={e => {
        const s = list.find(x => x.name === e.target.value);
        if(s) onChange({ name: s.name, rank: s.rank });
        else onChange({ name: e.target.value, rank: '' });
      }} 
      className="w-full border p-2 rounded-lg bg-slate-50 text-[11px] outline-none font-bold border-blue-50 focus:border-blue-400 cursor-pointer"
    >
      <option value="">-- Tùy chọn --</option>
      {(list || []).map(s => <option key={s.id} value={s.name}>{s.rank} {s.name}</option>)}
    </select>
  </div>
);

/* ================== PRINT TEMPLATE ================== */
const PrintTemplate = ({ doc }) => {
  const isReceipt = doc.type === 'Nhập';
  const totalAmount = (doc.items || []).reduce((sum, i) => sum + (i.qty * i.price), 0);
  const s = doc.signers || {};
  
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`
        @media print { .no-print { display: none !important; } }
        .print-table th, .print-table td { border: 1px solid black; padding: 5px; }
        .print-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      `}</style>
      <div className="flex justify-between items-start mb-6 text-center">
        <div><p className="uppercase text-[11px]">QUÂN KHU 4</p><p className="uppercase font-bold text-[11px] underline underline-offset-4 decoration-1">SƯ ĐOÀN 968</p></div>
        <div className="flex-1"><h2 className="text-2xl font-bold uppercase">{doc.type} KHO</h2></div>
        <div className="text-right text-[11px]"><p>Số: <span className="font-bold">{doc.code?.split('-')[1]}</span></p></div>
      </div>
      <div className="space-y-1 mb-6 text-[14px]">
        <p>{isReceipt ? 'Nhập của' : 'Xuất cho'}: <span className="font-bold underline">{doc.source || '..........'}</span></p>
        <p>Lệnh số: <span className="font-bold">{doc.refCode}</span>. Kho: <span className="font-bold">Kho 26, Sư đoàn 968.</span></p>
      </div>
      <table className="print-table text-[12px] text-center">
        <thead><tr className="font-bold uppercase"><th>TT</th><th className="w-[40%]">Tên hàng</th><th>ĐVT</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
        <tbody>
          {(doc.items || []).map((item, idx) => (
            <tr key={idx}><td>{idx + 1}</td><td className="text-left font-bold">{item.name}</td><td>{item.unit}</td><td className="font-bold">{item.qty}</td><td className="text-right">{item.price?.toLocaleString()}</td><td className="text-right">{(item.qty * item.price)?.toLocaleString()}</td></tr>
          ))}
          <tr className="font-bold"><td colSpan="5" className="text-right uppercase">Tổng cộng:</td><td className="text-right">{totalAmount.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <p className="mt-4 text-[13px] italic"><span className="font-bold underline">Bằng chữ:</span> ({docSoTiengViet(totalAmount)})</p>
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

/* ================== PHỤ TRỢ (Duy trì tính năng) ================== */
const Dashboard = ({ data }) => {
  const activeProducts = (data.products || []).filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left duration-500">
      <h2 className="text-2xl font-black text-slate-800 uppercase italic underline decoration-blue-500 underline-offset-8">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold uppercase tracking-widest text-[11px]">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={30}/></div><div><p className="text-slate-400">Số lượng mã hàng</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div></div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-b-4 border-b-emerald-500"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={30}/></div><div><p className="text-slate-400">Giá trị tồn kho</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div></div>
      </div>
      <div className="bg-slate-900 text-white p-4 rounded-xl text-[10px] font-mono italic opacity-60">
        * Hệ thống đã đồng bộ Zero line M1.
      </div>
    </div>
  );
};

const Products = ({ data, setData, log }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });
  const save = (e) => { e.preventDefault(); const p = { ...form, id: Date.now(), isActive: true, currentStock: 0 }; setData(prev => ({ ...prev, products: [...(prev.products || []), p] })); log(`Thêm hàng: ${p.name}`); setShowForm(false); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Danh mục hàng hóa</h2><button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold">+ THÊM MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold uppercase"><table className="w-full"><thead className="bg-slate-900 text-slate-400"><tr><th className="px-6 py-4">Mã</th><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">Tồn</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4 text-center">{p.currentStock} {p.unit}</td><td className="px-6 py-4 text-center"><button onClick={() => { if(window.confirm('Xóa?')) { setData(prev => ({...prev, products: (prev.products || []).map(x => x.id === p.id ? {...x, isActive: false} : x)})); log(`Xóa: ${p.name}`); } }} className="text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showForm && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-md"><form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl"><h3 className="text-xl font-black uppercase tracking-tighter italic">Thêm mặt hàng</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Tên hàng" required /><input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl bg-slate-50 font-mono" placeholder="Mã SKU" required /><input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Giá lẻ" required /><div className="flex gap-3 pt-2"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 font-bold text-slate-400">Hủy</button><button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold">Lưu lại</button></div></form></div>}
    </div>
  );
};

const HistoryTable = ({ data, setData, onOpenDetail, log }) => {
  const all = [...(data.receipts || []).map(r => ({...r, type: 'Nhập'})), ...(data.issues || []).map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left text-xs font-bold uppercase tracking-tighter"><thead className="bg-slate-900 text-white"><tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Tình trạng</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y">{all.map(d => (<tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(d)}><td className="px-6 py-4 text-blue-600 font-mono underline">{d.code}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span></td><td className="px-6 py-4">{d.isLocked ? <Lock size={14} className="text-red-500"/> : <Edit2 size={14} className="text-slate-300"/>}</td><td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}><button onClick={() => { if(!d.isLocked && window.confirm('Xóa?')) { setData(prev => ({...prev, [d.type==='Nhập'?'receipts':'issues']: (prev[d.type==='Nhập'?'receipts':'issues'] || []).filter(x => x.id !== d.id)})); log(`Xóa: ${d.code}`); } else if(d.isLocked) alert("Phiếu đã khóa!"); }} className={`p-2 rounded-lg ${d.isLocked ? 'text-slate-100' : 'text-red-400'}`}><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
    </div>
  );
};

const AuditManagement = ({ data, setData, log }) => {
  const [counts, setCounts] = useState({});
  const saveAudit = () => {
    const auditItems = (data.products || []).filter(p => p.isActive).map(p => { const real = Number(counts[p.id] || p.currentStock); return { id: p.id, name: p.name, systemStock: p.currentStock, realStock: real, diff: real - p.currentStock }; });
    setData(prev => ({ ...prev, audits: [{ id: Date.now(), date: new Date().toLocaleString(), items: auditItems }, ...(prev.audits || [])], products: (prev.products || []).map(p => ({ ...p, currentStock: counts[p.id] !== undefined ? Number(counts[p.id]) : p.currentStock })) }));
    log(`Kiểm kê`); alert("Cập nhật kho thành công!"); setCounts({});
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Kiểm kê kho thực tế</h2><button onClick={saveAudit} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all uppercase tracking-widest text-xs">Xác nhận số dư</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left text-xs font-bold uppercase tracking-tighter"><thead className="bg-slate-50 border-b"><tr><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">Hệ thống</th><th className="px-6 py-4 text-center">Thực tế</th><th className="px-6 py-4 text-center">Lệch</th></tr></thead>
      <tbody className="divide-y">{(data.products || []).filter(p => p.isActive).map(p => { const real = counts[p.id] !== undefined ? counts[p.id] : p.currentStock; const diff = real - p.currentStock; return (<tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4 text-center font-mono">{p.currentStock}</td><td className="px-6 py-4 text-center"><input type="number" value={real} onChange={e => setCounts({...counts, [p.id]: e.target.value})} className="w-16 border rounded p-1 text-center bg-blue-50 text-blue-600 outline-none focus:border-blue-400" /></td><td className={`px-6 py-4 text-center font-black ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-slate-300'}`}>{diff > 0 ? `+${diff}` : diff}</td></tr>);})}</tbody></table></div>
    </div>
  );
};

const UserManagement = ({ data, setData, log }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });
  const saveUser = (e) => { e.preventDefault(); setData(prev => ({ ...prev, users: [...(prev.users || []), { ...form, id: Date.now() }] })); log(`Tạo user: ${form.username}`); setShowModal(false); };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Quản lý tài khoản</h2><button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold">+ TẠO MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left text-xs font-bold uppercase"><thead className="bg-slate-50"><tr><th className="px-6 py-4">Tên người dùng</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead><tbody className="divide-y">{(data.users || []).map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4">{u.name} <span className="text-slate-400 text-[10px]">({u.username})</span></td><td className="px-6 py-4 text-center"><button disabled={u.username === 'admin'} onClick={() => setData(prev => ({...prev, users: (prev.users || []).filter(x => x.id !== u.id)}))} className="text-red-400 disabled:opacity-20"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showModal && <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><form onSubmit={saveUser} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl"><h3 className="text-xl font-black uppercase italic">Tạo User mới</h3><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Họ và tên" required /><input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Username" required /><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Mật khẩu" required /><div className="flex gap-3"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 font-bold text-slate-400">Hủy</button><button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold">Lưu</button></div></form></div>}
    </div>
  );
};