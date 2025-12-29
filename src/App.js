import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer, Eye,
  History, LayoutDashboard, List, ArrowDownCircle, ArrowUpCircle,
  Edit2, Users, ShieldCheck, DollarSign, X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/* ================== CẤU HÌNH & TIỆN ÍCH ================== */
const supabaseUrl = 'https://orjswsnioitwlvtukpjy.supabase.co';
const supabaseKey = 'sb_publishable_NKItGLk_9mXFVrRHSQKOKw_L-ulvjUP';
const supabase = createClient(supabaseUrl, supabaseKey);
const STORE_ID = "kho_chinh_pro_001"; 

// Hàm chuyển số thành chữ (Tiếng Việt)
function docSoTiengViet(so) {
    if (so === 0) return "Không đồng";
    const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const donVi = ["", "ngàn", "triệu", "tỷ"];
    let res = "";
    let tram, chuc, donvi;
    let i = 0;
    let so_str = Math.floor(so).toString();
    while (so_str.length > 0) {
        let group = parseInt(so_str.substring(Math.max(0, so_str.length - 3)));
        so_str = so_str.substring(0, Math.max(0, so_str.length - 3));
        if (group > 0) {
            tram = Math.floor(group / 100);
            chuc = Math.floor((group % 100) / 10);
            donvi = group % 10;
            let group_str = "";
            if (tram > 0) group_str += chuSo[tram] + " trăm ";
            else if (res !== "") group_str += "không trăm ";
            if (chuc > 1) group_str += chuSo[chuc] + " mươi ";
            else if (chuc === 1) group_str += "mười ";
            else if (tram > 0 && donvi > 0) group_str += "lẻ ";
            if (donvi === 5 && chuc > 0) group_str += "lăm ";
            else if (donvi === 1 && chuc > 1) group_str += "mốt ";
            else if (donvi > 0 || (tram === 0 && chuc === 0 && res === "")) group_str += chuSo[donvi] + " ";
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
  logs: []
};

/* ================== COMPONENT CHÍNH ================== */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null); // Phiếu đang chọn để xem/in
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        let { data: cloud } = await supabase.from('warehouse_data').select('content').eq('store_id', STORE_ID).maybeSingle();
        if (cloud) setData(cloud.content);
        else await supabase.from('warehouse_data').insert({ store_id: STORE_ID, content: initialData });
      } finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(async () => { await supabase.from('warehouse_data').upsert({ store_id: STORE_ID, content: data }); }, 500);
      return () => clearTimeout(t);
    }
  }, [data, loading]);

  const handleLogin = e => {
    e.preventDefault();
    const u = data.users.find(x => x.username === loginForm.username && x.password === loginForm.password);
    if (!u) return alert('Sai tài khoản hoặc mật khẩu');
    setCurrentUser(u);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-slate-500 italic">Đang tải dữ liệu hệ thống...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4 border border-slate-200">
          <div className="text-center mb-6">
            <Package className="text-blue-600 mx-auto mb-2" size={40} />
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Warehouse Pro</h1>
          </div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 outline-none" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 outline-none" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold uppercase">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print border-r border-slate-800">
        <div className="font-black text-white mb-10 flex items-center gap-2 px-2 text-xl italic tracking-tighter"><ShieldCheck className="text-blue-500"/> W-MANAGER</div>
        <nav className="space-y-1.5 flex-1 text-sm font-medium">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Danh mục hàng hóa" />
          <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Giao dịch</div>
          <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
          <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />
          
          {/* TRẢ LẠI MỤC QUẢN LÝ TÀI KHOẢN CHO ADMIN */}
          {currentUser.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hệ thống</div>
              <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Quản lý tài khoản" />
            </>
          )}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-4">
          <p className="px-3 text-[10px] text-slate-500 uppercase font-bold">Người dùng: {currentUser.name}</p>
          <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-xs font-bold w-full hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={16}/> ĐĂNG XUẤT</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} currentUser={currentUser} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} currentUser={currentUser} />}
        {activeTab === 'history' && <HistoryTable data={data} onOpenDetail={(doc) => setSelectedDoc(doc)} />}
        {activeTab === 'users' && <UserManagement data={data} setData={setData} />}
      </main>

      {/* MODAL XEM CHI TIẾT & IN PHIẾU */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-2xl relative p-8 shadow-2xl border border-white">
            <div className="no-print absolute top-4 right-4 flex gap-2">
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"><Printer size={18}/> IN PHIẾU</button>
              <button onClick={() => setSelectedDoc(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"><X/></button>
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
    <Icon size={18} /> {label}
  </button>
);

/* ================== COMPONENT: MẪU PHIẾU CHI TIẾT (Theo ảnh) ================== */
const PrintTemplate = ({ doc }) => {
  const isReceipt = doc.type === 'Nhập';
  const totalAmount = doc.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
  
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-area { width: 100%; border: none; padding: 0; }
        }
        .print-table th, .print-table td { border: 1px solid black; padding: 6px 10px; }
        .print-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      `}</style>

      {/* Header chuẩn mẫu Quân khu */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-center">
          <p className="uppercase text-[13px]">QUÂN KHU 4</p>
          <p className="uppercase font-bold text-[13px] underline decoration-1 underline-offset-4">SƯ ĐOÀN 968</p>
        </div>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold uppercase">{isReceipt ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</h2>
        </div>
        <div className="text-right text-[13px]">
          <p>Biểu SS14-QN10</p>
          <p>Số: <span className="font-bold">{doc.code.split('-')[1]}</span></p>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-1.5 mb-6 text-[15px]">
        <p>{isReceipt ? 'Nhập của' : 'Xuất cho'}: <span className="font-bold underline">{doc.source || 'Đ/c Ký'}</span></p>
        <p>Theo phiếu {isReceipt ? 'xuất' : 'nhập'} kho số: <span className="font-bold underline">{doc.refCode || 'X70'}</span> ngày {doc.date.split(' ')[0]}</p>
        <p>Hàng do: <span className="font-bold underline">{doc.transport || 'Lữ đoàn 654 vận chuyển'}</span></p>
        <p>Kho {isReceipt ? 'nhận' : 'xuất'} hàng: <span className="font-bold underline">Kho 26, Phòng Hậu cần - Kỹ thuật, Sư đoàn 968.</span></p>
      </div>

      {/* Bảng dữ liệu tách cột như mẫu */}
      <table className="print-table text-[14px] text-center">
        <thead>
          <tr className="font-bold uppercase">
            <th rowSpan="2" className="w-10">TT</th>
            <th rowSpan="2" className="w-[40%]">Tên hàng</th>
            <th rowSpan="2">ĐVT</th>
            <th colSpan="2">Số lượng</th>
            <th rowSpan="2">Giá lẻ</th>
            <th rowSpan="2">Thành tiền</th>
            <th rowSpan="2">Ghi chú</th>
          </tr>
          <tr className="font-bold text-[11px]">
            <th className="w-16">Phải {isReceipt ? 'nhập' : 'xuất'}</th>
            <th className="w-16">Thực {isReceipt ? 'nhập' : 'xuất'}</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td className="text-left font-medium">{item.name}</td>
              <td>{item.unit}</td>
              <td className="text-red-600 font-bold">{item.qty}</td>
              <td>{item.qty}</td>
              <td className="text-right">{item.price.toLocaleString()}</td>
              <td className="text-right">{(item.qty * item.price).toLocaleString()}</td>
              <td></td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan="3">Tổng {isReceipt ? 'nhập' : 'xuất'} {doc.items.length} mặt hàng</td>
            <td colSpan="2"></td>
            <td>Thành tiền:</td>
            <td className="text-right">{totalAmount.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Số tiền bằng chữ */}
      <p className="mt-5 text-[15px]">
        <span className="font-bold underline italic">Viết bằng chữ:</span> 
        <span className="italic"> ({docSoTiengViet(totalAmount)})</span>
      </p>

      {/* Chữ ký 5 cột chuẩn */}
      <div className="mt-10 grid grid-cols-5 text-center text-[11px] font-bold uppercase leading-tight gap-2">
        <div><p>NGƯỜI VIẾT PHIẾU</p><div className="h-24"></div><p>Đại úy</p><p>Nguyễn Lê Nhật Ký</p></div>
        <div><p>{isReceipt ? 'NGƯỜI GIAO' : 'NGƯỜI NHẬN'}</p><div className="h-24"></div><p>Đại úy</p><p>Nguyễn Lê Nhật Ký</p></div>
        <div><p>THỦ KHO</p><div className="h-24"></div><p>Thiếu tá</p><p>Nguyễn Thị Nga</p></div>
        <div><p>TRƯỞNG BAN</p><div className="h-24"></div><p>Trung tá</p><p>Trương Văn Diện</p></div>
        <div>
          <p className="normal-case italic font-normal mb-1 text-xs">Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
          <p>TL. SƯ ĐOÀN TRƯỞNG</p><p className="text-[9px]">CHỦ NHIỆM HẬU CẦN-KỸ THUẬT</p><div className="h-20"></div><p>Thượng tá</p><p>Phạm Ngọc Hầu</p>
        </div>
      </div>
    </div>
  );
};

/* ================== COMPONENT: HISTORY (Bấm vào để xem chi tiết) ================== */
const HistoryTable = ({ data, onOpenDetail }) => {
  const all = [...data.receipts.map(r => ({...r, type: 'Nhập'})), ...data.issues.map(i => ({...i, type: 'Xuất'}))].sort((a,b) => b.id - a.id);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tight">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm font-bold uppercase">
          <thead className="bg-slate-900 text-white text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Mã phiếu</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Ngày giờ</th>
              <th className="px-6 py-4">Đơn vị đối ứng</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {all.map(d => (
              <tr 
                key={d.id} 
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                onClick={() => onOpenDetail(d)}
              >
                <td className="px-6 py-4 text-blue-600 font-mono tracking-tighter">{d.code}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {d.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-medium font-serif lowercase">{d.date}</td>
                <td className="px-6 py-4 text-slate-700">{d.source || '---'}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Eye size={16}/>
                    </button>
                    <button className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <Printer size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {all.length === 0 && <div className="text-center py-20 text-slate-400 font-bold italic border-2 border-dashed rounded-2xl">Chưa có giao dịch nào được ghi nhận.</div>}
    </div>
  );
};

/* ================== COMPONENT: USER MANAGEMENT (Trả lại cho Admin) ================== */
const UserManagement = ({ data, setData }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'editor' });

  const saveUser = (e) => {
    e.preventDefault();
    setData(prev => ({ ...prev, users: [...prev.users, { ...form, id: Date.now() }] }));
    setShowModal(false);
    setForm({ username: '', password: '', name: '', role: 'editor' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">Quản lý tài khoản</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700">
          <Plus size={18} /> THÊM TÀI KHOẢN
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm font-bold uppercase">
          <thead className="bg-slate-50 border-b text-slate-500 text-[10px] tracking-widest">
            <tr><th className="px-6 py-4">Họ và tên</th><th className="px-6 py-4">Tên đăng nhập</th><th className="px-6 py-4">Quyền hạn</th><th className="px-6 py-4 text-center">Xóa</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 italic">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-black text-slate-800">{u.name}</td>
                <td className="px-6 py-4 text-blue-600 font-mono italic lowercase">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    disabled={u.username === 'admin'}
                    onClick={() => setData(prev => ({...prev, users: prev.users.filter(x => x.id !== u.id)}))}
                    className={`p-2 rounded-lg ${u.username === 'admin' ? 'text-slate-200 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form onSubmit={saveUser} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tighter border-b pb-4">Tạo tài khoản mới</h3>
            <div className="space-y-4 font-bold">
              <div><label className="text-[10px] uppercase text-slate-400 block mb-1">Họ tên đầy đủ</label><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 outline-none" required /></div>
              <div><label className="text-[10px] uppercase text-slate-400 block mb-1">Tên đăng nhập</label><input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 outline-none font-mono" required /></div>
              <div><label className="text-[10px] uppercase text-slate-400 block mb-1">Mật khẩu</label><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 outline-none" required /></div>
              <div><label className="text-[10px] uppercase text-slate-400 block mb-1">Phân quyền</label><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 outline-none"><option value="editor">Nhân viên kho</option><option value="admin">Quản trị viên</option></select></div>
            </div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-3 font-bold text-slate-400">HỦY</button><button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">LƯU TÀI KHOẢN</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

/* Dashboard & Transaction giữ nguyên như bản trước để đảm bảo tính ổn định */
const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Package size={30}/></div>
          <div><p className="text-slate-400 text-[10px] uppercase tracking-widest">Mặt hàng</p><h3 className="text-2xl font-black">{activeProducts.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><DollarSign size={30}/></div>
          <div><p className="text-slate-400 text-[10px] uppercase tracking-widest">Giá trị tồn kho</p><h3 className="text-2xl font-black">{totalValue.toLocaleString()}đ</h3></div>
        </div>
      </div>
    </div>
  );
};

const Transaction = ({ type, data, setData, currentUser }) => {
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' });
  const products = data.products.filter(p => p.isActive);

  const save = () => {
    if (!cart.length) return;
    const newDoc = {
      id: Date.now(),
      type: type === 'in' ? 'Nhập' : 'Xuất',
      code: `${type==='in'?'PN':'PX'}-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString('vi-VN'),
      user: currentUser.name,
      items: [...cart],
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
    setCart([]); setInfo({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' }); alert("Ghi phiếu thành công!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold uppercase">
      <div>
        <h2 className="text-2xl font-black mb-6 italic">{type==='in'?'Nhập kho':'Xuất kho'}</h2>
        <div className="bg-white border rounded-3xl h-[500px] overflow-y-auto divide-y shadow-inner">
          {products.map(p => (
            <button key={p.id} onClick={() => {
              const ex = cart.find(x => x.id === p.id);
              if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
              else setCart([...cart, {...p, qty: 1}]);
            }} className="w-full text-left p-5 hover:bg-blue-50 flex justify-between items-center group transition-all">
              <div><span className="text-slate-800 block">{p.name}</span><span className="text-[10px] text-slate-400 font-mono italic">Tồn hiện tại: {p.currentStock} {p.unit}</span></div>
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={18}/></div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl h-fit border border-slate-800">
        <h3 className="text-blue-400 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4 uppercase tracking-[3px] text-xs font-black">Lập chi tiết phiếu</h3>
        <div className="space-y-4 mb-6 text-sm">
          <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 font-bold" placeholder={type==='in'?'Nhập của (đơn vị giao)...':'Xuất cho (đơn vị nhận)...'} value={info.source} onChange={e=>setInfo({...info, source:e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none text-xs" placeholder="Mã phiếu đối ứng" value={info.refCode} onChange={e=>setInfo({...info, refCode:e.target.value})} />
             <input className="w-full bg-slate-800 border-none p-3 rounded-xl outline-none text-xs" placeholder="Đơn vị vận chuyển" value={info.transport} onChange={e=>setInfo({...info, transport:e.target.value})} />
          </div>
        </div>
        <div className="space-y-3 max-h-56 overflow-y-auto mb-6 pr-2">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs truncate max-w-[150px] font-black">{i.name}</span>
              <div className="flex items-center gap-3">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-16 bg-slate-900 border-none rounded-lg p-2 text-center font-black text-blue-400" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6">
          <div className="flex justify-between text-2xl font-black mb-6 tracking-tighter"><span>TỔNG:</span><span className="text-blue-400">{cart.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}đ</span></div>
          <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black shadow-lg shadow-blue-900/40 transition-all active:scale-95 uppercase tracking-widest text-sm">XÁC NHẬN GHI PHIẾU</button>
        </div>
      </div>
    </div>
  );
};