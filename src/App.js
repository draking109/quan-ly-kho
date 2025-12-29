import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X, Lock, ClipboardCheck, Activity, Wifi, WifiOff
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
  logs: [], // Nhật ký hành động
  audits: [] // Kiểm kê kho
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

  // Theo dõi trạng thái mạng (PWA/Offline)
  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        let local = localStorage.getItem('warehouse_offline_data');
        if (local && !navigator.onLine) {
          setData(JSON.parse(local));
        } else {
          let { data: cloud } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
          if (cloud) setData(cloud.content);
          else await supabase.from('warehouse_data').insert({ store_id: STORE_ID, content: initialData });
        }
      } finally { setLoading(false); }
    };
    loadData();
  }, []);

  // Lưu data (Sync logic)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('warehouse_offline_data', JSON.stringify(data));
      if (isOnline) {
        const t = setTimeout(async () => { 
          await supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data }); 
        }, 1000);
        return () => clearTimeout(t);
      }
    }
  }, [data, loading, isOnline]);

  // Hàm ghi nhật ký hệ thống
  const addSystemLog = (action) => {
    const newLog = {
      id: Date.now(),
      user: currentUser?.name || 'Hệ thống',
      action,
      time: new Date().toLocaleString('vi-VN')
    };
    setData(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 200) }));
  };

  const handleLogin = e => {
    e.preventDefault();
    const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password);
    if (!u) return alert('Sai tài khoản!');
    setCurrentUser(u);
    addSystemLog(`Đăng nhập vào hệ thống`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-slate-500">Đang đồng bộ dữ liệu...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4 border border-slate-200">
          <div className="text-center mb-6">
            <ShieldCheck className="text-blue-600 mx-auto mb-2" size={48} />
            <h1 className="text-2xl font-black text-slate-800 uppercase italic">Warehouse Pro V2</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hệ thống quản lý kho Sư đoàn 968</p>
          </div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 outline-none font-bold" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 outline-none font-bold" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold uppercase hover:bg-blue-600 transition-all">Truy cập hệ thống</button>
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
          <span className="text-[9px] flex items-center gap-1 uppercase not-italic tracking-tighter">
            {isOnline ? <><Wifi size={10} className="text-emerald-500"/> Trực tuyến</> : <><WifiOff size={10} className="text-red-500"/> Ngoại tuyến (Đang lưu đệm)</>}
          </span>
        </div>
        
        <nav className="space-y-1 flex-1 text-xs font-bold uppercase tracking-tighter">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Hàng hóa" />
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest">Giao dịch</div>
          <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
          <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử" />
          
          <div className="pt-4 pb-1 px-3 text-[9px] text-slate-600 tracking-widest">Nghiệp vụ</div>
          <NavBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={ClipboardCheck} label="Kiểm kê kho" />
          <NavBtn active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={Activity} label="Nhật ký hệ thống" />
          
          {currentUser.role === 'admin' && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Tài khoản" />
            </div>
          )}
        </nav>

        <button onClick={() => { addSystemLog('Đăng xuất'); setCurrentUser(null); }} className="text-red-400 p-3 flex items-center gap-2 text-[10px] font-black w-full hover:bg-red-500/10 rounded-xl mt-4"><LogOut size={14}/> ĐĂNG XUẤT</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} user={currentUser} log={addSystemLog} />}
        {activeTab === 'history' && <HistoryTable data={data} setData={setData} onOpenDetail={setSelectedDoc} log={addSystemLog} />}
        {activeTab === 'audit' && <AuditManagement data={data} setData={setData} log={addSystemLog} />}
        {activeTab === 'logs' && <SystemLogs logs={data.logs} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} log={addSystemLog} />}
      </main>

      {/* MODAL PHIẾU */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8 shadow-2xl">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => { 
                addSystemLog(`In phiếu ${selectedDoc.code}`);
                // Tự động khóa phiếu khi in nếu chưa khóa
                if(!selectedDoc.isLocked) {
                  setData(prev => {
                    const listKey = selectedDoc.type === 'Nhập' ? 'receipts' : 'issues';
                    return {...prev, [listKey]: prev[listKey].map(d => d.id === selectedDoc.id ? {...d, isLocked: true} : d)};
                  });
                }
                window.print(); 
              }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
                <Printer size={18}/> {selectedDoc.isLocked ? 'IN LẠI PHIẾU' : 'IN & KHÓA PHIẾU'}
              </button>
              <button onClick={() => setSelectedDoc(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600"><X/></button>
            </div>
            {selectedDoc.isLocked && <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border border-red-200 no-print"><Lock size={12}/> Phiếu đã khóa - Chống sửa đổi</div>}
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

/* ================== 1 & 3: XỬ LÝ PHIẾU (KHÓA & PHÂN LOẠI) ================== */
const Transaction = ({ type, data, setData, user, log }) => {
  const [cart, setCart] = useState([]);
  const [issueType, setIssueType] = useState('Tiêu thụ nội bộ');
  const [info, setInfo] = useState({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' });

  const save = () => {
    if (!cart.length) return;
    const code = `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`;
    const newDoc = {
      id: Date.now(),
      type: type === 'in' ? 'Nhập' : 'Xuất',
      issueType: type === 'out' ? issueType : null,
      code,
      date: new Date().toLocaleString('vi-VN'),
      user: user.name,
      items: [...cart],
      isLocked: false, // 1. Mặc định chưa khóa khi mới tạo
      ...info
    };

    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        const i = cart.find(x => x.id === p.id);
        return i ? { ...p, currentStock: type === 'in' ? p.currentStock + i.qty : p.currentStock - i.qty } : p;
      }),
      [type === 'in' ? 'receipts' : 'issues']: [newDoc, ...prev[type === 'in' ? 'receipts' : 'issues']]
    }));

    log(`Lập phiếu ${newDoc.type} kho: ${code}`);
    setCart([]); setInfo({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' });
    alert("Đã lưu phiếu thành công!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold uppercase">
      <div>
        <h2 className="text-2xl font-black mb-6 italic">{type==='in'?'Nhập hàng':'Xuất hàng'}</h2>
        {type === 'out' && (
          <div className="mb-4 bg-white p-4 rounded-2xl border shadow-sm">
            <label className="text-[10px] text-slate-400 block mb-2 tracking-widest">Hình thức xuất kho</label>
            <div className="flex gap-2">
              {['Tiêu thụ nội bộ', 'Điều chuyển', 'Thanh lý', 'Hủy bỏ'].map(t => (
                <button key={t} onClick={() => setIssueType(t)} className={`px-3 py-2 rounded-lg text-[10px] transition-all border ${issueType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{t}</button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white border rounded-3xl h-[450px] overflow-y-auto divide-y shadow-sm">
          {data.products.filter(p => p.isActive).map(p => (
            <button key={p.id} onClick={() => {
              const ex = cart.find(x => x.id === p.id);
              if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
              else setCart([...cart, {...p, qty: 1}]);
            }} className="w-full text-left p-5 hover:bg-blue-50 flex justify-between items-center group">
              <div><span className="text-slate-800 block">{p.name}</span><span className="text-[10px] text-slate-400 font-mono italic">Kho: {p.currentStock} {p.unit}</span></div>
              <Plus size={18} className="text-blue-500 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl h-fit border border-slate-800">
        <h3 className="text-blue-400 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4 uppercase tracking-[3px] text-xs font-black">Nội dung phiếu</h3>
        <div className="space-y-4 mb-6 text-sm">
          <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none" placeholder={type==='in'?'Đơn vị giao...':'Đơn vị nhận...'} value={info.source} onChange={e=>setInfo({...info, source:e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none text-xs" placeholder="Mã lệnh/Số hiệu" value={info.refCode} onChange={e=>setInfo({...info, refCode:e.target.value})} />
             <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none text-xs" placeholder="Vận chuyển" value={info.transport} onChange={e=>setInfo({...info, transport:e.target.value})} />
          </div>
        </div>
        <div className="space-y-3 max-h-56 overflow-y-auto mb-6 pr-2">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs truncate max-w-[150px] font-black">{i.name}</span>
              <div className="flex items-center gap-3">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-16 bg-slate-900 border-none rounded-lg p-2 text-center font-black text-blue-400" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black shadow-lg shadow-blue-900/40 uppercase tracking-widest text-sm">Ghi phiếu & Trừ kho</button>
      </div>
    </div>
  );
};

/* ================== 4: KIỂM KÊ KHO & CHÊNH LỆCH ================== */
const AuditManagement = ({ data, setData, log }) => {
  const [counts, setCounts] = useState({}); // { productId: realQty }
  
  const saveAudit = () => {
    const auditItems = data.products.filter(p => p.isActive).map(p => {
      const real = Number(counts[p.id] || 0);
      return {
        id: p.id,
        name: p.name,
        systemStock: p.currentStock,
        realStock: real,
        diff: real - p.currentStock
      };
    });

    const newAudit = {
      id: Date.now(),
      date: new Date().toLocaleString('vi-VN'),
      items: auditItems,
      note: `Kiểm kê định kỳ bởi Admin`
    };

    // Cập nhật lại kho theo số thực tế
    setData(prev => ({
      ...prev,
      audits: [newAudit, ...prev.audits],
      products: prev.products.map(p => ({
        ...p,
        currentStock: counts[p.id] !== undefined ? Number(counts[p.id]) : p.currentStock
      }))
    }));

    log(`Thực hiện kiểm kê kho định kỳ`);
    alert("Đã cập nhật số dư kho theo kết quả kiểm kê!");
    setCounts({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase italic">Kiểm kê kho thực tế</h2>
        <button onClick={saveAudit} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
          <ClipboardCheck size={18}/> XÁC NHẬN KIỂM KÊ
        </button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm font-bold uppercase">
          <thead className="bg-slate-50 border-b text-[10px] tracking-widest text-slate-500">
            <tr><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">Tồn hệ thống</th><th className="px-6 py-4 text-center">Tồn thực tế</th><th className="px-6 py-4 text-center">Chênh lệch</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.products.filter(p => p.isActive).map(p => {
              const real = counts[p.id] !== undefined ? counts[p.id] : p.currentStock;
              const diff = real - p.currentStock;
              return (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 text-center font-mono">{p.currentStock}</td>
                  <td className="px-6 py-4 text-center">
                    <input type="number" value={real} onChange={e => setCounts({...counts, [p.id]: e.target.value})} className="w-20 border rounded p-1 text-center bg-blue-50 text-blue-600 outline-none" />
                  </td>
                  <td className={`px-6 py-4 text-center font-black ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-slate-300'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================== 2: NHẬT KÝ HÀNH ĐỘNG CHI TIẾT ================== */
const SystemLogs = ({ logs }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-black uppercase italic">Nhật ký hệ thống</h2>
    <div className="bg-white rounded-2xl border shadow-sm p-4 h-[600px] overflow-y-auto">
      <div className="space-y-3">
        {logs.map(log => (
          <div key={log.id} className="flex items-center gap-4 text-xs font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-mono w-40">{log.time}</span>
            <span className="text-blue-600 uppercase w-32 truncate">[{log.user}]</span>
            <span className="text-slate-800 italic">{log.action}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ================== CÁC COMPONENT PHỤ (Duy trì tính năng cũ) ================== */

const HistoryTable = ({ data, setData, onOpenDetail, log }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  
  const deleteDoc = (doc) => {
    if(doc.isLocked) return alert("Hành động bị chặn: Phiếu này đã in và khóa, không thể xóa!");
    if(window.confirm(`Bạn có chắc muốn xóa phiếu ${doc.code}?`)) {
      const listKey = doc.type === 'Nhập' ? 'receipts' : 'issues';
      setData(prev => ({...prev, [listKey]: prev[listKey].filter(x => x.id !== doc.id)}));
      log(`Xóa phiếu ${doc.code}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase italic">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm font-bold uppercase">
          <thead className="bg-slate-900 text-white text-[10px] tracking-widest">
            <tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Phân loại</th><th className="px-6 py-4">Ngày giờ</th><th className="px-6 py-4 text-center">Tình trạng</th><th className="px-6 py-4 text-center">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {all.map(d => (
              <tr key={d.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => onOpenDetail(d)}>
                <td className="px-6 py-4 text-blue-600 font-mono tracking-tighter">{d.code}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span></td>
                <td className="px-6 py-4 text-[10px] text-slate-500 italic">{d.issueType || 'Nhập từ ngoài'}</td>
                <td className="px-6 py-4 text-slate-400 font-serif italic lowercase">{d.date}</td>
                <td className="px-6 py-4 text-center">
                  {d.isLocked ? <Lock size={14} className="mx-auto text-red-500"/> : <Edit2 size={14} className="mx-auto text-slate-300"/>}
                </td>
                <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => deleteDoc(d)} className={`p-2 rounded-lg transition-all ${d.isLocked ? 'text-slate-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Mẫu in chuẩn (Tiếp tục sử dụng mẫu cũ nhưng thêm loại xuất kho)
const PrintTemplate = ({ doc }) => {
  const isReceipt = doc.type === 'Nhập';
  const totalAmount = doc.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`
        @media print { .no-print { display: none !important; } }
        .print-table th, .print-table td { border: 1px solid black; padding: 6px; }
        .print-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      `}</style>
      <div className="flex justify-between items-start mb-6">
        <div className="text-center"><p className="uppercase text-[12px]">QUÂN KHU 4</p><p className="uppercase font-bold text-[12px] underline decoration-1 underline-offset-4">SƯ ĐOÀN 968</p></div>
        <div className="text-center flex-1"><h2 className="text-2xl font-bold uppercase">{isReceipt ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</h2><p className="text-[11px] italic normal-case">({doc.issueType || 'Theo kế hoạch cấp phát'})</p></div>
        <div className="text-right text-[12px]"><p>Biểu SS14-QN10</p><p>Số: <span className="font-bold">{doc.code.split('-')[1]}</span></p></div>
      </div>
      <div className="space-y-1.5 mb-6 text-[14px]">
        <p>{isReceipt ? 'Nhập của' : 'Xuất cho'}: <span className="font-bold underline">{doc.source || '..........'}</span></p>
        <p>Lý do: <span className="italic">{doc.issueType || 'Cung ứng hậu cần'}</span>. Lệnh số: <span className="font-bold">{doc.refCode}</span></p>
        <p>Kho: <span className="font-bold">Kho 26, Phòng Hậu cần - Kỹ thuật, Sư đoàn 968.</span></p>
      </div>
      <table className="print-table text-[13px] text-center">
        <thead>
          <tr className="font-bold uppercase"><th>TT</th><th className="w-[40%]">Tên hàng</th><th>ĐVT</th><th colSpan="2">Số lượng (Phải/Thực)</th><th>Giá lẻ</th><th>Thành tiền</th></tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={idx}><td>{idx + 1}</td><td className="text-left font-medium">{item.name}</td><td>{item.unit}</td><td className="font-bold text-red-600">{item.qty}</td><td>{item.qty}</td><td className="text-right">{item.price.toLocaleString()}</td><td className="text-right">{(item.qty * item.price).toLocaleString()}</td></tr>
          ))}
          <tr className="font-bold"><td colSpan="6" className="text-right uppercase">Tổng cộng:</td><td className="text-right">{totalAmount.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <p className="mt-5 text-[14px] italic"><span className="font-bold underline">Bằng chữ:</span> ({docSoTiengViet(totalAmount)})</p>
      <div className="mt-10 grid grid-cols-5 text-center text-[10px] font-bold uppercase leading-tight">
        <div><p>Người lập phiếu</p><div className="h-20"></div><p>Nguyễn Lê Nhật Ký</p></div>
        <div><p>{isReceipt ? 'Người giao' : 'Người nhận'}</p><div className="h-20"></div><p>Đ/c Ký</p></div>
        <div><p>Thủ kho</p><div className="h-20"></div><p>Nguyễn Thị Nga</p></div>
        <div><p>Trưởng ban</p><div className="h-20"></div><p>Trương Văn Diện</p></div>
        <div><p className="normal-case italic font-normal mb-1">Ngày {doc.date.split(' ')[0]}</p><p>TL. Sư đoàn trưởng</p><div className="h-16"></div><p>Phạm Ngọc Hầu</p></div>
      </div>
    </div>
  );
};

/* CÁC COMPONENT CÒN LẠI (Dashboard, Products, UserManagement) giống bản cũ nhưng thêm hàm LOG */
const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-blue-500 underline-offset-8">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold uppercase">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={30}/></div>
          <div><p className="text-slate-400 text-[9px] tracking-widest">Mặt hàng</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={30}/></div>
          <div><p className="text-slate-400 text-[9px] tracking-widest">Giá trị tồn kho</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div>
        </div>
      </div>
      <div className="bg-slate-900 text-white p-4 rounded-xl text-[10px] font-mono italic">
        * Hệ thống đã ghi nhận đường Zero line cho M1 theo quy định.
      </div>
    </div>
  );
};

const Products = ({ data, setData, log }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Bộ', price: 0 });

  const save = (e) => {
    e.preventDefault();
    const product = { ...form, id: Date.now(), isActive: true, currentStock: 0 };
    setData(prev => ({ ...prev, products: [...prev.products, product] }));
    log(`Thêm mặt hàng mới: ${product.name}`);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Danh mục hàng hóa</h2><button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><Plus size={18}/> THÊM MỚI</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-xs font-bold uppercase">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-[9px] tracking-widest"><tr><th className="px-6 py-4">Mã SKU</th><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4">ĐVT</th><th className="px-6 py-4 text-right">Đơn giá</th><th className="px-6 py-4 text-center">Tồn kho</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {data.products.filter(p => p.isActive).map(p => (
              <tr key={p.id} className="hover:bg-blue-50/30">
                <td className="px-6 py-4 font-mono text-blue-600">{p.sku}</td>
                <td className="px-6 py-4 text-slate-800">{p.name}</td>
                <td className="px-6 py-4">{p.unit}</td>
                <td className="px-6 py-4 text-right">{p.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-center text-blue-600 text-sm">{p.currentStock}</td>
                <td className="px-6 py-4 text-center"><button onClick={() => { if(window.confirm('Xóa hàng?')) { setData(prev => ({...prev, products: prev.products.map(x => x.id === p.id ? {...x, isActive: false} : x)})); log(`Xóa mặt hàng: ${p.name}`); } }} className="text-red-400"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-black uppercase border-b pb-4">Tạo mặt hàng</h3>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Tên hàng" required />
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl bg-slate-50 font-mono" placeholder="Mã SKU (VD: M1-001)" required />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Giá lẻ" />
              <input value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="ĐVT" />
            </div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 font-bold text-slate-400">HỦY</button><button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">LƯU LẠI</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

const UserManagement = ({ data, setData, log }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });
  const saveUser = (e) => {
    e.preventDefault();
    const newUser = { ...form, id: Date.now() };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    log(`Thêm tài khoản người dùng: ${newUser.username}`);
    setShowModal(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black uppercase italic">Quản lý tài khoản</h2><button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">+ THÊM</button></div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left text-xs font-bold uppercase"><thead className="bg-slate-50 border-b text-slate-500"><tr><th className="px-6 py-4">Tên</th><th className="px-6 py-4">User</th><th className="px-6 py-4">Quyền</th><th className="px-6 py-4 text-center">Xóa</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{data.users.map(u => (<tr key={u.id} className="hover:bg-slate-50"><td className="px-6 py-4">{u.name}</td><td className="px-6 py-4 font-mono">{u.username}</td><td className="px-6 py-4 text-blue-600">{u.role}</td><td className="px-6 py-4 text-center"><button disabled={u.username === 'admin'} onClick={() => { setData(prev => ({...prev, users: prev.users.filter(x => x.id !== u.id)})); log(`Xóa tài khoản: ${u.username}`); }} className="text-red-400 disabled:opacity-20"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50"><form onSubmit={saveUser} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl"><h3 className="text-xl font-black uppercase">Tạo User</h3>
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Họ tên" required />
        <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="User" required />
        <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Pass" required />
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50"><option value="editor">Editor</option><option value="admin">Admin</option></select>
        <div className="flex gap-3"><button type="button" onClick={()=>setShowModal(false)} className="flex-1">Hủy</button><button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-3">Lưu</button></div></form></div>
      )}
    </div>
  );
};