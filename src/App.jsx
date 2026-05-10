import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import jsPDF from "jspdf";
import {
  StickyNote, CheckSquare, Calendar, Bell, Plus, Trash2,
  Check, ChevronLeft, ChevronRight, Clock, X, LogOut,
  User, Search, FileDown, Tag
} from "lucide-react";

const T = {
  bg: '#0C0C15',
  surface: '#13131D',
  card: '#1A1A27',
  border: '#25253A',
  accent: '#F59E0B',
  accentGlow: 'rgba(245,158,11,0.12)',
  indigo: '#818CF8',
  emerald: '#34D399',
  rose: '#FB7185',
  text: '#ECF0F8',
  muted: '#6B7280',
  subtle: '#9CA3AF',
};

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const TAGS = ['Kerja', 'Kuliah', 'Pribadi', 'Ide', 'Penting', 'Lainnya'];
const TAG_COLORS = {
  'Kerja': '#818CF8', 'Kuliah': '#38BDF8', 'Pribadi': '#34D399',
  'Ide': '#F59E0B', 'Penting': '#FB7185', 'Lainnya': '#9CA3AF'
};

const Input = ({ value, onChange, placeholder, multiline, rows = 4, type = 'text', style }) => {
  const s = {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '10px 12px', color: T.text, fontSize: 14,
    outline: 'none', resize: 'vertical', fontFamily: "'Outfit',sans-serif",
    boxSizing: 'border-box', ...style,
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />;
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 460, border: `1px solid ${T.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: T.text, margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const SaveBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: T.accent, color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Outfit',sans-serif" }}>
    <Check size={14} /> Simpan
  </button>
);

const CancelBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: 'transparent', color: T.subtle, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit',sans-serif" }}>Batal</button>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '56px 0', color: T.muted }}>
    <div style={{ opacity: 0.35, marginBottom: 12 }}>{icon}</div>
    <p style={{ margin: 0, fontSize: 13 }}>{text}</p>
  </div>
);

const PageHeader = ({ title, subtitle, onAdd }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
    <div>
      <h1 style={{ color: T.text, margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h1>
      <p style={{ color: T.muted, margin: '3px 0 0', fontSize: 12 }}>{subtitle}</p>
    </div>
    {onAdd && (
      <button onClick={onAdd} style={{ background: T.accent, color: '#000', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Outfit',sans-serif" }}>
        <Plus size={15} /> Tambah
      </button>
    )}
  </div>
);

const SearchBar = ({ value, onChange }) => (
  <div style={{ position: 'relative', marginBottom: 16 }}>
    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Cari..." style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px 8px 34px', color: T.text, fontSize: 13, outline: 'none', fontFamily: "'Outfit',sans-serif", boxSizing: 'border-box' }} />
  </div>
);

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handle = async () => {
    setLoading(true); setMsg('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMsg(error.message);
        else setMsg('Cek email kamu untuk konfirmasi akun!');
      }
    } catch (e) { setMsg('Terjadi kesalahan.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: T.accent, letterSpacing: '-0.5px' }}>✦ Fokus</span>
          <p style={{ color: T.muted, marginTop: 6, fontSize: 13 }}>productivity app</p>
        </div>
        <div style={{ background: T.card, borderRadius: 16, padding: 28, border: `1px solid ${T.border}` }}>
          <h2 style={{ color: T.text, margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>
            {mode === 'login' ? 'Masuk ke akun' : 'Buat akun baru'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input value={email} onChange={setEmail} placeholder="Email" type="email" />
            <Input value={password} onChange={setPassword} placeholder="Password (min. 6 karakter)" type="password" />
            {msg && (
              <p style={{ color: msg.includes('Cek') ? T.emerald : T.rose, fontSize: 12, margin: 0, padding: '8px 12px', background: msg.includes('Cek') ? T.emerald + '15' : T.rose + '15', borderRadius: 8 }}>{msg}</p>
            )}
            <button onClick={handle} disabled={loading} style={{ background: T.accent, color: '#000', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: "'Outfit',sans-serif", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Loading...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
            <p style={{ color: T.muted, fontSize: 12, textAlign: 'center', margin: 0 }}>
              {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMsg(''); }} style={{ color: T.accent, cursor: 'pointer', fontWeight: 600 }}>
                {mode === 'login' ? 'Daftar' : 'Masuk'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const noteColors = ['#F59E0B', '#818CF8', '#34D399', '#FB7185', '#38BDF8', '#A78BFA'];

function NotesView({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [form, setForm] = useState({ title: '', content: '', color: '#818CF8', tag: '' });

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    setNotes(data || []); setLoading(false);
  };

  const openNew = () => { setEditing(null); setForm({ title: '', content: '', color: '#818CF8', tag: '' }); setModal(true); };
  const openEdit = (n) => { setEditing(n.id); setForm({ title: n.title, content: n.content, color: n.color, tag: n.tag || '' }); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) return;
    if (editing) await supabase.from('notes').update(form).eq('id', editing);
    else await supabase.from('notes').insert({ ...form, user_id: user.id });
    setModal(false); fetchNotes();
  };

  const del = async (id) => { await supabase.from('notes').delete().eq('id', id); fetchNotes(); };

  const exportPDF = (n) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(n.title, 20, 20);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(n.content || '', 170);
    doc.text(lines, 20, 35);
    doc.save(`${n.title}.pdf`);
  };

  const filtered = notes
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()))
    .filter(n => !filterTag || n.tag === filterTag);

  return (
    <div>
      <PageHeader title="Catatan" subtitle={`${notes.length} catatan tersimpan`} onAdd={openNew} />
      <SearchBar value={search} onChange={setSearch} />

      {/* Filter Tag */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilterTag('')} style={{ background: !filterTag ? T.accentGlow : 'transparent', color: !filterTag ? T.accent : T.muted, border: `1px solid ${!filterTag ? T.accent : T.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Semua</button>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilterTag(filterTag === t ? '' : t)} style={{ background: filterTag === t ? TAG_COLORS[t] + '22' : 'transparent', color: filterTag === t ? TAG_COLORS[t] : T.muted, border: `1px solid ${filterTag === t ? TAG_COLORS[t] : T.border}`, borderRadius: 20, padding: '3px 12px', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{t}</button>
        ))}
      </div>

      {loading ? <p style={{ color: T.muted, fontSize: 13 }}>Memuat...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, paddingBottom: 100 }}>
          {filtered.map(n => (
            <div key={n.id} onClick={() => openEdit(n)} style={{ background: T.card, borderRadius: 12, padding: 16, cursor: 'pointer', border: `1px solid ${T.border}`, borderTop: `3px solid ${n.color}`, transition: 'transform 0.15s,box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ color: T.text, margin: 0, fontSize: 14, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>{n.title}</h3>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); exportPDF(n); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '0 0 0 4px' }} title="Export PDF"><FileDown size={13} /></button>
                  <button onClick={e => { e.stopPropagation(); del(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '0 0 0 4px' }}><Trash2 size={13} /></button>
                </div>
              </div>
              {n.tag && <span style={{ fontSize: 10, color: TAG_COLORS[n.tag], background: TAG_COLORS[n.tag] + '20', padding: '2px 8px', borderRadius: 10, display: 'inline-block', marginBottom: 6 }}>{n.tag}</span>}
              <p style={{ color: T.subtle, margin: 0, fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.content}</p>
              <p style={{ color: T.muted, fontSize: 10, marginTop: 10, marginBottom: 0 }}>{new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState icon={<StickyNote size={40} />} text="Tidak ada catatan ditemukan" />}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Catatan' : 'Catatan Baru'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Judul catatan..." />
          <Input value={form.content} onChange={v => setForm({ ...form, content: v })} placeholder="Isi catatan..." multiline rows={5} />
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>TAG</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setForm({ ...form, tag: '' })} style={{ background: !form.tag ? T.accentGlow : 'transparent', color: !form.tag ? T.accent : T.muted, border: `1px solid ${!form.tag ? T.accent : T.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Tanpa Tag</button>
              {TAGS.map(t => (
                <button key={t} onClick={() => setForm({ ...form, tag: t })} style={{ background: form.tag === t ? TAG_COLORS[t] + '22' : 'transparent', color: form.tag === t ? TAG_COLORS[t] : T.muted, border: `1px solid ${form.tag === t ? TAG_COLORS[t] : T.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>WARNA LABEL</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {noteColors.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} /><SaveBtn onClick={save} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TodoView({ user }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ text: '', priority: 'medium', due_date: '' });

  const prioColor = { high: T.rose, medium: T.accent, low: T.emerald };
  const prioLabel = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    setLoading(true);
    const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
    setTodos(data || []); setLoading(false);
  };

  const add = async () => {
    if (!form.text.trim()) return;
    await supabase.from('todos').insert({ ...form, user_id: user.id, done: false });
    setForm({ text: '', priority: 'medium', due_date: '' }); setModal(false); fetchTodos();
  };

  const toggle = async (t) => { await supabase.from('todos').update({ done: !t.done }).eq('id', t.id); fetchTodos(); };
  const del = async (id) => { await supabase.from('todos').delete().eq('id', id); fetchTodos(); };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Daftar Tugas', 20, 20);
    doc.setFontSize(11);
    let y = 35;
    todos.forEach((t, i) => {
      const status = t.done ? '[✓]' : '[ ]';
      const lines = doc.splitTextToSize(`${status} ${t.text}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7 + 3;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save('daftar-tugas.pdf');
  };

  const filtered = todos
    .filter(t => filter === 'active' ? !t.done : filter === 'done' ? t.done : true)
    .filter(t => !search || t.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="To-Do" subtitle={`${todos.filter(t => !t.done).length} tugas belum selesai`} onAdd={() => setModal(true)} />
      <SearchBar value={search} onChange={setSearch} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'Semua'], ['active', 'Aktif'], ['done', 'Selesai']].map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? T.accentGlow : 'transparent', color: filter === f ? T.accent : T.muted, border: `1px solid ${filter === f ? T.accent : T.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{label}</button>
          ))}
        </div>
        <button onClick={exportPDF} style={{ background: 'transparent', color: T.indigo, border: `1px solid ${T.indigo}`, borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
          <FileDown size={13} /> Export PDF
        </button>
      </div>

      {loading ? <p style={{ color: T.muted, fontSize: 13 }}>Memuat...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 100 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: T.card, borderRadius: 12, padding: '12px 16px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, opacity: t.done ? 0.45 : 1, transition: 'opacity 0.2s' }}>
              <button onClick={() => toggle(t)} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: t.done ? T.emerald : 'transparent', border: `2px solid ${t.done ? T.emerald : T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.done && <Check size={12} color="#000" />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, color: T.text, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{t.text}</p>
                {t.due_date && <p style={{ margin: '3px 0 0', color: T.muted, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {t.due_date}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: prioColor[t.priority], background: prioColor[t.priority] + '18', padding: '2px 8px', borderRadius: 10 }}>{prioLabel[t.priority]}</span>
                <button onClick={() => del(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 2 }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <EmptyState icon={<CheckSquare size={40} />} text="Tidak ada tugas ditemukan" />}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Tugas Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.text} onChange={v => setForm({ ...form, text: v })} placeholder="Deskripsi tugas..." />
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>PRIORITAS</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{ flex: 1, background: form.priority === p ? prioColor[p] + '20' : 'transparent', color: form.priority === p ? prioColor[p] : T.muted, border: `1px solid ${form.priority === p ? prioColor[p] : T.border}`, borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>{prioLabel[p]}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>TENGGAT (opsional)</p>
            <Input value={form.due_date} onChange={v => setForm({ ...form, due_date: v })} type="date" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} /><SaveBtn onClick={add} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

const evColors = ['#F59E0B', '#818CF8', '#34D399', '#FB7185', '#38BDF8'];

function CalendarView({ user }) {
  const [base, setBase] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState([]);
  const [selDay, setSelDay] = useState(today.getDate());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', color: '#818CF8' });

  const yr = base.getFullYear(), mo = base.getMonth();
  const firstDow = new Date(yr, mo, 1).getDay();
  const daysCount = new Date(yr, mo + 1, 0).getDate();
  const monthLabel = base.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const ds = (d) => `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const evOn = (d) => events.filter(e => e.date === ds(d));

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    setEvents(data || []);
  };

  const addEvent = async () => {
    if (!form.title.trim()) return;
    await supabase.from('events').insert({ ...form, date: ds(selDay), user_id: user.id });
    setForm({ title: '', color: '#818CF8' }); setModal(false); fetchEvents();
  };

  const del = async (id) => { await supabase.from('events').delete().eq('id', id); fetchEvents(); };
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysCount }, (_, i) => i + 1)];

  return (
    <div>
      <PageHeader title="Planner" subtitle={monthLabel} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => setBase(new Date(yr, mo - 1, 1))} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: 'pointer', padding: '6px 10px' }}><ChevronLeft size={16} /></button>
        <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{monthLabel}</span>
        <button onClick={() => setBase(new Date(yr, mo + 1, 1))} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: 'pointer', padding: '6px 10px' }}><ChevronRight size={16} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {dayNames.map(d => <div key={d} style={{ textAlign: 'center', color: T.muted, fontSize: 10, padding: '4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 24 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`n${i}`} />;
          const isToday = ds(day) === todayStr, isSel = selDay === day, evs = evOn(day);
          return (
            <div key={day} onClick={() => setSelDay(day)} style={{ borderRadius: 8, padding: '5px 2px', textAlign: 'center', minHeight: 44, background: isToday ? T.accentGlow : 'transparent', border: `1px solid ${isToday ? T.accent : isSel ? T.indigo : T.border}`, cursor: 'pointer' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? T.accent : T.text, marginBottom: 2 }}>{day}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                {evs.slice(0, 3).map(e => <div key={e.id} style={{ width: 5, height: 5, borderRadius: '50%', background: e.color }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ color: T.subtle, fontSize: 13, margin: 0 }}>{selDay} {base.toLocaleString('id-ID', { month: 'long' })}</p>
          <button onClick={() => { setModal(true); setForm({ title: '', color: '#818CF8' }); }} style={{ background: 'transparent', color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={13} /> Event</button>
        </div>
        {evOn(selDay).length === 0
          ? <p style={{ color: T.muted, fontSize: 13 }}>Tidak ada event. Tekan "+ Event" untuk menambah.</p>
          : evOn(selDay).map(e => (
            <div key={e.id} style={{ background: T.card, borderRadius: 10, padding: '10px 14px', marginBottom: 8, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <span style={{ color: T.text, fontSize: 14, flex: 1 }}>{e.title}</span>
              <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><Trash2 size={13} /></button>
            </div>
          ))
        }
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={`Tambah Event — ${selDay} ${base.toLocaleString('id-ID', { month: 'long' })}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Nama event..." />
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>WARNA</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {evColors.map(c => <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent' }} />)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} /><SaveBtn onClick={addEvent} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RemindersView({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: todayStr, time: '08:00' });

  useEffect(() => { fetchReminders(); }, []);

  const fetchReminders = async () => {
    setLoading(true);
    const { data } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  };

  const add = async () => {
    if (!form.title.trim()) return;
    await supabase.from('reminders').insert({ ...form, user_id: user.id, done: false });
    setForm({ title: '', date: todayStr, time: '08:00' }); setModal(false); fetchReminders();
  };

  const toggle = async (r) => { await supabase.from('reminders').update({ done: !r.done }).eq('id', r.id); fetchReminders(); };
  const del = async (id) => { await supabase.from('reminders').delete().eq('id', id); fetchReminders(); };

  const filtered = items.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()));
  const active = filtered.filter(r => !r.done), done = filtered.filter(r => r.done);

  const Card = ({ r }) => (
    <div style={{ background: T.card, borderRadius: 12, padding: '12px 16px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, opacity: r.done ? 0.4 : 1, transition: 'opacity 0.2s', marginBottom: 8 }}>
      <button onClick={() => toggle(r)} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: r.done ? T.emerald : 'transparent', border: `2px solid ${r.done ? T.emerald : T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {r.done && <Check size={12} color="#000" />}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: T.text, fontSize: 14, textDecoration: r.done ? 'line-through' : 'none' }}>{r.title}</p>
        <p style={{ margin: '3px 0 0', color: T.muted, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {r.date} • {r.time}</p>
      </div>
      <button onClick={() => del(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 2 }}><Trash2 size={13} /></button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Pengingat" subtitle={`${items.filter(r => !r.done).length} pengingat aktif`} onAdd={() => setModal(true)} />
      <SearchBar value={search} onChange={setSearch} />
      {loading ? <p style={{ color: T.muted, fontSize: 13 }}>Memuat...</p> : (
        <div style={{ paddingBottom: 100 }}>
          {active.map(r => <Card key={r.id} r={r} />)}
          {done.length > 0 && (<><p style={{ color: T.muted, fontSize: 11, marginTop: 20, marginBottom: 8, letterSpacing: '0.5px' }}>SELESAI</p>{done.map(r => <Card key={r.id} r={r} />)}</>)}
          {filtered.length === 0 && <EmptyState icon={<Bell size={40} />} text="Tidak ada pengingat ditemukan" />}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Pengingat Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Judul pengingat..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><p style={{ color: T.subtle, fontSize: 11, marginBottom: 6, marginTop: 0 }}>TANGGAL</p><Input value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" /></div>
            <div><p style={{ color: T.subtle, fontSize: 11, marginBottom: 6, marginTop: 0 }}>WAKTU</p><Input value={form.time} onChange={v => setForm({ ...form, time: v })} type="time" /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} /><SaveBtn onClick={add} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function FokusApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('notes');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet'; document.head.appendChild(link);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}>
      <p style={{ color: T.muted }}>Memuat...</p>
    </div>
  );

  if (!user) return <AuthPage />;

  const tabs = [
    { id: 'notes', label: 'Catatan', Icon: StickyNote },
    { id: 'todos', label: 'To-Do', Icon: CheckSquare },
    { id: 'calendar', label: 'Planner', Icon: Calendar },
    { id: 'reminders', label: 'Pengingat', Icon: Bell },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Outfit',sans-serif", color: T.text }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 20px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: T.accent, letterSpacing: '-0.5px' }}>✦ Fokus</span>
          <span style={{ fontSize: 11, color: T.muted }}>productivity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 12 }}>
            <User size={13} /> {user.email.split('@')[0]}
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, cursor: 'pointer', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: "'Outfit',sans-serif" }}>
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 20px 0', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'notes' && <NotesView user={user} />}
        {tab === 'todos' && <TodoView user={user} />}
        {tab === 'calendar' && <CalendarView user={user} />}
        {tab === 'reminders' && <RemindersView user={user} />}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0 20px', zIndex: 100, backdropFilter: 'blur(12px)' }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active ? T.accent : T.muted, padding: '4px 20px', transition: 'color 0.15s' }}>
              <div style={{ padding: '4px 12px', borderRadius: 20, background: active ? T.accentGlow : 'transparent', transition: 'background 0.15s' }}><Icon size={20} /></div>
              <span style={{ fontSize: 10, fontFamily: "'Outfit',sans-serif", fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}