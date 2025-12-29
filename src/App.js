import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Package, LogOut, Trash2, Search, Printer,
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
  const [selectedPrint, setSelectedPrint] = useState(null); // Phiếu đang chọn để in
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-slate-500 italic">Đang tải dữ liệu...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4 border border-slate-200">
          <div className="text-center mb-6">
            <Package className="text-blue-600 mx-auto mb-2" size={40} />
            <h1 className="text-2xl font-black text-slate-800 uppercase">Warehouse Pro</h1>
          </div>
          <input className="w-full border p-3 rounded-xl bg-slate-50 outline-none" placeholder="Tên đăng nhập" onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
          <input type="password" className="w-full border p-3 rounded-xl bg-slate-50 outline-none" placeholder="Mật khẩu" onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold">ĐĂNG NHẬP</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-4 flex flex-col no-print">
        <div className="font-black text-white mb-10 flex items-center gap-2 px-2 text-xl italic"><ShieldCheck className="text-blue-500"/> W-MANAGER</div>
        <nav className="space-y-1.5 flex-1 text-sm font-medium">
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Báo cáo tổng quan" />
          <NavBtn active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={List} label="Danh mục hàng hóa" />
          <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Giao dịch</div>
          <NavBtn active={activeTab === 'in'} onClick={() => setActiveTab('in')} icon={ArrowDownCircle} label="Nhập kho" />
          <NavBtn active={activeTab === 'out'} onClick={() => setActiveTab('out')} icon={ArrowUpCircle} label="Xuất kho" />
          <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Lịch sử phiếu" />
        </nav>
        <button onClick={() => setCurrentUser(null)} className="text-red-400 p-3 flex items-center gap-2 text-xs font-bold w-full hover:bg-red-500/10 rounded-xl mt-auto"><LogOut size={16}/> ĐĂNG XUẤT</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen no-print">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'products' && <Products data={data} setData={setData} />}
        {activeTab === 'in' && <Transaction type="in" data={data} setData={setData} currentUser={currentUser} />}
        {activeTab === 'out' && <Transaction type="out" data={data} setData={setData} currentUser={currentUser} />}
        {activeTab === 'history' && <HistoryTable data={data} onPrint={(p) => setSelectedPrint(p)} />}
      </main>

      {/* Modal In Phiếu */}
      {selectedPrint && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[95vh] overflow-y-auto rounded-xl relative p-8">
            <button onClick={() => setSelectedPrint(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full no-print"><X/></button>
            <div className="no-print mb-6 flex justify-end"><button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18}/> IN PHIẾU NGAY</button></div>
            <PrintTemplate doc={selectedPrint} />
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

/* ================== COMPONENT: MẪU IN PHIẾU (QUAN TRỌNG) ================== */
const PrintTemplate = ({ doc }) => {
  const isReceipt = doc.type === 'Nhập';
  return (
    <div className="print-area font-serif text-black p-4 leading-tight">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-area { width: 100%; }
        }
        .print-table th, .print-table td { border: 1px solid black; padding: 4px 8px; }
        .print-table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-center">
          <p className="uppercase text-sm">Quân khu 4</p>
          <p className="uppercase font-bold text-sm underline decoration-1 underline-offset-4">Sư đoàn 968</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold uppercase">{isReceipt ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</h2>
        </div>
        <div className="text-right text-sm">
          <p>Biểu SS14-QN10</p>
          <p>Số: <span className="font-bold">{doc.code.split('-')[1]}</span></p>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-1 mb-4 text-sm">
        <p>{isReceipt ? 'Nhập của' : 'Xuất cho'}: <span className="font-bold">{doc.source || '.........................................................'}</span></p>
        <p>Theo phiếu {isReceipt ? 'xuất' : 'nhập'} kho số: <span className="font-bold">{doc.refCode || '............'}</span> ngày {doc.date.split(' ')[0]}</p>
        <p>Hàng do: <span className="font-bold">{doc.transport || 'Lữ đoàn 654 vận chuyển'}</span></p>
        <p>Kho {isReceipt ? 'nhận' : 'xuất'} hàng: <span className="font-bold">Kho 26, Phòng Hậu cần - Kỹ thuật, Sư đoàn 968.</span></p>
      </div>

      {/* Bảng dữ liệu */}
      <table className="print-table text-sm text-center">
        <thead>
          <tr className="font-bold">
            <th rowSpan="2">TT</th>
            <th rowSpan="2" className="w-[35%]">Tên hàng</th>
            <th rowSpan="2">ĐVT</th>
            <th colSpan="2">Số lượng</th>
            <th rowSpan="2">Giá lẻ</th>
            <th rowSpan="2">Thành tiền</th>
            <th rowSpan="2">Ghi chú</th>
          </tr>
          <tr className="font-bold text-xs">
            <th>Phải {isReceipt ? 'nhập' : 'xuất'}</th>
            <th>Thực {isReceipt ? 'nhập' : 'xuất'}</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td className="text-left">{item.name}</td>
              <td>{item.unit}</td>
              <td>{item.qty}</td>
              <td>{item.qty}</td>
              <td className="text-right">{item.price.toLocaleString()}</td>
              <td className="text-right">{(item.qty * item.price).toLocaleString()}</td>
              <td></td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan="3">Tổng {isReceipt ? 'nhập' : 'xuất'} {doc.items.length} mặt hàng</td>
            <td></td>
            <td></td>
            <td>Thành tiền:</td>
            <td className="text-right">
              {doc.items.reduce((sum, i) => sum + (i.qty * i.price), 0).toLocaleString()}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Số tiền bằng chữ */}
      <p className="mt-4 text-sm">
        <span className="font-bold underline italic">Viết bằng chữ:</span> 
        <span className="italic"> ({docSoTiengViet(doc.items.reduce((sum, i) => sum + (i.qty * i.price), 0))})</span>
      </p>

      {/* Chữ ký */}
      <div className="mt-8 grid grid-cols-5 text-center text-[11px] font-bold uppercase leading-tight">
        <div>
          <p>Người viết phiếu</p>
          <div className="h-20"></div>
          <p>Đại úy</p>
          <p>Nguyễn Lê Nhật Ký</p>
        </div>
        <div>
          <p>{isReceipt ? 'Người giao' : 'Người nhận'}</p>
          <div className="h-20"></div>
          <p>Đại úy</p>
          <p>Nguyễn Lê Nhật Ký</p>
        </div>
        <div>
          <p>Thủ kho</p>
          <div className="h-20"></div>
          <p>Thiếu tá</p>
          <p>Nguyễn Thị Nga</p>
        </div>
        <div>
          <p>Trưởng ban</p>
          <div className="h-20"></div>
          <p>Trung tá</p>
          <p>Trương Văn Diện</p>
        </div>
        <div>
          <p className="normal-case italic font-normal mb-1 text-xs">Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</p>
          <p>TL. Sư đoàn trưởng</p>
          <p>Chủ nhiệm hậu cần-kỹ thuật</p>
          <div className="h-16"></div>
          <p>Thượng tá</p>
          <p>Phạm Ngọc Hầu</p>
        </div>
      </div>
    </div>
  );
};

/* ================== CÁC COMPONENT GIAO DIỆN (Đã tối ưu) ================== */

const Dashboard = ({ data }) => {
  const activeProducts = data.products.filter(p => p.isActive);
  const totalValue = activeProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Báo cáo tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Package size={30}/></div>
          <div><p className="text-slate-400 text-xs uppercase">Mặt hàng</p><h3 className="text-2xl">{activeProducts.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={30}/></div>
          <div><p className="text-slate-400 text-xs uppercase">Giá trị tồn</p><h3 className="text-2xl">{totalValue.toLocaleString()}đ</h3></div>
        </div>
      </div>
    </div>
  );
};

const Products = ({ data, setData }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', unit: 'Cái', price: 0 });
  const list = data.products.filter(p => p.isActive);

  const save = (e) => {
    e.preventDefault();
    const product = { ...form, id: Date.now(), isActive: true, currentStock: 0 };
    setData(prev => ({ ...prev, products: [...prev.products, product] }));
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase">Danh mục hàng hóa</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> THÊM MỚI</button>
      </div>
      <div className="bg-white rounded-2xl border shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[11px] tracking-widest">
            <tr>
              <th className="px-6 py-4">STT</th><th className="px-6 py-4">Mã</th><th className="px-6 py-4">Tên hàng</th><th className="px-6 py-4 text-center">ĐVT</th><th className="px-6 py-4 text-right">Giá lẻ</th><th className="px-6 py-4 text-center">Tồn kho</th><th className="px-6 py-4 text-right">Thành tiền</th><th className="px-6 py-4 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((p, i) => (
              <tr key={p.id} className="hover:bg-blue-50/50">
                <td className="px-6 py-4 text-center text-slate-400 font-bold">{i+1}</td>
                <td className="px-6 py-4 font-mono text-blue-600 font-bold">{p.sku}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-center">{p.unit}</td>
                <td className="px-6 py-4 text-right">{p.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-center font-black">{p.currentStock}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-600">{(p.currentStock * p.price).toLocaleString()}</td>
                <td className="px-6 py-4 text-center"><button onClick={() => setData(prev => ({...prev, products: prev.products.map(x => x.id === p.id ? {...x, isActive: false} : x)}))} className="text-red-400"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-xl font-black uppercase border-b pb-4">Thêm hàng mới</h3>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50 font-bold" placeholder="Tên hàng" required />
            <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value.toUpperCase()})} className="w-full border p-3 rounded-xl bg-slate-50 font-mono" placeholder="Mã SKU" required />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Giá lẻ" />
              <input value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="w-full border p-3 rounded-xl bg-slate-50" placeholder="ĐVT" />
            </div>
            <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-3 font-bold">Hủy</button><button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">LƯU</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

const Transaction = ({ type, data, setData, currentUser }) => {
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' });
  const products = data.products.filter(p => p.isActive);

  const save = () => {
    if (!cart.length) return;
    if (type === 'out') {
      for (const item of cart) {
        const origin = data.products.find(p => p.id === item.id);
        if (item.qty > origin.currentStock) return alert(`${item.name} không đủ hàng!`);
      }
    }
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
    setCart([]); setInfo({ source: '', transport: 'Lữ đoàn 654 vận chuyển', refCode: '' }); alert("Thành công!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold uppercase">
      <div>
        <h2 className="text-2xl font-black mb-6">{type==='in'?'Nhập kho':'Xuất kho'}</h2>
        <div className="bg-white border rounded-2xl h-[500px] overflow-y-auto divide-y shadow-sm">
          {products.map(p => (
            <button key={p.id} onClick={() => {
              const ex = cart.find(x => x.id === p.id);
              if (ex) setCart(cart.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x));
              else setCart([...cart, {...p, qty: 1}]);
            }} className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center group">
              <div><span className="text-slate-800 block">{p.name}</span><span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} | Tồn: {p.currentStock}</span></div>
              <Plus size={20} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl h-fit">
        <h3 className="text-blue-400 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4 uppercase tracking-widest"><List size={20}/> Chi tiết phiếu</h3>
        <div className="space-y-3 mb-6">
          <input className="w-full bg-slate-800 border-none p-2 rounded text-xs" placeholder={type==='in'?'Nhập từ đơn vị nào?':'Xuất cho đơn vị nào?'} value={info.source} onChange={e=>setInfo({...info, source:e.target.value})} />
          <input className="w-full bg-slate-800 border-none p-2 rounded text-xs" placeholder="Mã phiếu đối ứng (số lệnh)" value={info.refCode} onChange={e=>setInfo({...info, refCode:e.target.value})} />
          <input className="w-full bg-slate-800 border-none p-2 rounded text-xs" placeholder="Đơn vị vận chuyển" value={info.transport} onChange={e=>setInfo({...info, transport:e.target.value})} />
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2">
          {cart.map((i, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-xs truncate max-w-[150px]">{i.name}</span>
              <div className="flex items-center gap-3">
                <input type="number" value={i.qty} onChange={e => { const n=[...cart]; n[idx].qty=Math.max(1, Number(e.target.value)); setCart(n); }} className="w-14 bg-slate-900 border-none rounded p-1 text-center font-black text-blue-400" />
                <button onClick={()=>{const n=[...cart]; n.splice(idx,1); setCart(n)}} className="text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6">
          <div className="flex justify-between text-xl mb-6"><span>TỔNG:</span><span className="text-blue-400">{cart.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}đ</span></div>
          <button onClick={save} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black shadow-lg">XÁC NHẬN PHIẾU</button>
        </div>
      </div>
    </div>
  );
};

const HistoryTable = ({ data, onPrint }) => {
  const all = [...data.receipts, ...data.issues].sort((a,b) => b.id - a.id);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase">Lịch sử giao dịch</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm font-bold uppercase">
          <thead className="bg-slate-50 border-b text-slate-500 text-[10px] tracking-widest">
            <tr><th className="px-6 py-4">Mã phiếu</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Ngày giờ</th><th className="px-6 py-4">Người lập</th><th className="px-6 py-4 text-center">In</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 italic font-medium">
            {all.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-blue-600 font-mono tracking-tighter">{d.code}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] ${d.type === 'Nhập' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span></td>
                <td className="px-6 py-4 text-slate-400 font-serif">{d.date}</td>
                <td className="px-6 py-4 text-slate-700">{d.user}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onPrint(d)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Printer size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};