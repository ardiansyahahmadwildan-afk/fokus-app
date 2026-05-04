import { useState, useEffect } from "react";
import {
  StickyNote, CheckSquare, Calendar, Bell, Plus, Trash2,
  Check, ChevronLeft, ChevronRight, Clock, X
} from "lucide-react";

// ─── THEME ───────────────────────────────────────────────────────────────────
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
  sky: '#38BDF8',
  text: '#ECF0F8',
  muted: '#6B7280',
  subtle: '#9CA3AF',
};

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// ─── LOCALSTORAGE HOOK ───────────────────────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { }
  }, [key, state]);
  return [state, setState];
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Input = ({ value, onChange, placeholder, multiline, rows = 4, type = 'text', style }) => {
  const s = {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '10px 12px', color: T.text, fontSize: 14,
    outline: 'none', resize: 'vertical', fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box', ...style,
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />;
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.card, borderRadius: 16, padding: 24, width: '100%', maxWidth: 460,
        border: `1px solid ${T.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: T.text, margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const SaveBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: T.accent, color: '#000', border: 'none', borderRadius: 8,
    padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Outfit', sans-serif",
  }}>
    <Check size={14} /> Simpan
  </button>
);

const CancelBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: 'transparent', color: T.subtle, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
  }}>Batal</button>
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
      <button onClick={onAdd} style={{
        background: T.accent, color: '#000', border: 'none', borderRadius: 10,
        padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Outfit', sans-serif",
      }}>
        <Plus size={15} /> Tambah
      </button>
    )}
  </div>
);

// ─── NOTES ───────────────────────────────────────────────────────────────────
const noteColors = ['#F59E0B', '#818CF8', '#34D399', '#FB7185', '#38BDF8', '#A78BFA'];

function NotesView() {
  const [notes, setNotes] = useLocalStorage('fokus_notes', [
    { id: 1, title: 'Selamat datang di Fokus! 🎉', content: 'Ini catatan pertamamu. Klik kartu untuk mengedit, atau tekan "+ Tambah" untuk membuat catatan baru.', color: '#F59E0B', at: new Date().toISOString() },
  ]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', color: '#818CF8' });

  const openNew = () => { setEditing(null); setForm({ title: '', content: '', color: '#818CF8' }); setModal(true); };
  const openEdit = (n) => { setEditing(n.id); setForm({ title: n.title, content: n.content, color: n.color }); setModal(true); };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) setNotes(notes.map(n => n.id === editing ? { ...n, ...form } : n));
    else setNotes([{ id: Date.now(), ...form, at: new Date().toISOString() }, ...notes]);
    setModal(false);
  };

  return (
    <div>
      <PageHeader title="Catatan" subtitle={`${notes.length} catatan tersimpan`} onAdd={openNew} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 14, paddingBottom: 100 }}>
        {notes.map(n => (
          <div key={n.id} onClick={() => openEdit(n)} style={{
            background: T.card, borderRadius: 12, padding: 16, cursor: 'pointer',
            border: `1px solid ${T.border}`, borderTop: `3px solid ${n.color}`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h3 style={{ color: T.text, margin: 0, fontSize: 14, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>{n.title}</h3>
              <button onClick={e => { e.stopPropagation(); setNotes(notes.filter(x => x.id !== n.id)); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: '0 0 0 8px', flexShrink: 0,
              }}><Trash2 size={13} /></button>
            </div>
            <p style={{
              color: T.subtle, margin: 0, fontSize: 12, lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{n.content}</p>
            <p style={{ color: T.muted, fontSize: 10, marginTop: 10, marginBottom: 0 }}>
              {new Date(n.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        ))}
        {notes.length === 0 && <EmptyState icon={<StickyNote size={40} />} text="Belum ada catatan" />}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Catatan' : 'Catatan Baru'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Judul catatan..." />
          <Input value={form.content} onChange={v => setForm({ ...form, content: v })} placeholder="Isi catatan..." multiline rows={5} />
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>WARNA LABEL</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {noteColors.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                  width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                  outline: form.color === c ? `2px solid ${c}` : 'none',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} />
            <SaveBtn onClick={save} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── TODO ─────────────────────────────────────────────────────────────────────
function TodoView() {
  const [todos, setTodos] = useLocalStorage('fokus_todos', [
    { id: 1, text: 'Buat akun Vercel untuk deploy aplikasi ini', done: false, priority: 'high', dueDate: todayStr },
    { id: 2, text: 'Eksplorasi semua fitur Fokus', done: false, priority: 'medium', dueDate: '' },
    { id: 3, text: 'Install Node.js dan setup project', done: true, priority: 'low', dueDate: '' },
  ]);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ text: '', priority: 'medium', dueDate: '' });

  const prioColor = { high: T.rose, medium: T.accent, low: T.emerald };
  const prioLabel = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };

  const filtered = todos.filter(t =>
    filter === 'active' ? !t.done : filter === 'done' ? t.done : true
  );

  const add = () => {
    if (!form.text.trim()) return;
    setTodos([{ id: Date.now(), ...form, done: false }, ...todos]);
    setForm({ text: '', priority: 'medium', dueDate: '' });
    setModal(false);
  };

  return (
    <div>
      <PageHeader title="To-Do" subtitle={`${todos.filter(t => !t.done).length} tugas belum selesai`} onAdd={() => setModal(true)} />

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['all', 'Semua'], ['active', 'Aktif'], ['done', 'Selesai']].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? T.accentGlow : 'transparent',
            color: filter === f ? T.accent : T.muted,
            border: `1px solid ${filter === f ? T.accent : T.border}`,
            borderRadius: 20, padding: '4px 14px', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 100 }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            background: T.card, borderRadius: 12, padding: '12px 16px',
            border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12,
            opacity: t.done ? 0.45 : 1, transition: 'opacity 0.2s',
          }}>
            <button onClick={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: t.done ? T.emerald : 'transparent',
              border: `2px solid ${t.done ? T.emerald : T.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.done && <Check size={12} color="#000" />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: T.text, fontSize: 14, textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{t.text}</p>
              {t.dueDate && (
                <p style={{ margin: '3px 0 0', color: T.muted, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {t.dueDate}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: prioColor[t.priority], background: prioColor[t.priority] + '18', padding: '2px 8px', borderRadius: 10 }}>{prioLabel[t.priority]}</span>
              <button onClick={() => setTodos(todos.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 2 }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon={<CheckSquare size={40} />} text="Tidak ada tugas" />}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Tugas Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.text} onChange={v => setForm({ ...form, text: v })} placeholder="Deskripsi tugas..." />
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>PRIORITAS</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                  flex: 1, background: form.priority === p ? prioColor[p] + '20' : 'transparent',
                  color: form.priority === p ? prioColor[p] : T.muted,
                  border: `1px solid ${form.priority === p ? prioColor[p] : T.border}`,
                  borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                }}>{prioLabel[p]}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: T.subtle, fontSize: 11, marginBottom: 8, marginTop: 0 }}>TENGGAT (opsional)</p>
            <Input value={form.dueDate} onChange={v => setForm({ ...form, dueDate: v })} type="date" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} />
            <SaveBtn onClick={add} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const evColors = ['#F59E0B', '#818CF8', '#34D399', '#FB7185', '#38BDF8'];

function CalendarView() {
  const [base, setBase] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useLocalStorage('fokus_events', [
    { id: 1, date: todayStr, title: 'Mulai pakai Fokus!', color: '#F59E0B' },
  ]);
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

  const addEvent = () => {
    if (!form.title.trim()) return;
    setEvents([...events, { id: Date.now(), date: ds(selDay), ...form }]);
    setForm({ title: '', color: '#818CF8' });
    setModal(false);
  };

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysCount }, (_, i) => i + 1)];

  return (
    <div>
      <PageHeader title="Planner" subtitle={monthLabel} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => setBase(new Date(yr, mo - 1, 1))} style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          color: T.text, cursor: 'pointer', padding: '6px 10px',
        }}><ChevronLeft size={16} /></button>
        <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{monthLabel}</span>
        <button onClick={() => setBase(new Date(yr, mo + 1, 1))} style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
          color: T.text, cursor: 'pointer', padding: '6px 10px',
        }}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {dayNames.map(d => <div key={d} style={{ textAlign: 'center', color: T.muted, fontSize: 10, padding: '4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 24 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`n${i}`} />;
          const isToday = ds(day) === todayStr;
          const isSel = selDay === day;
          const evs = evOn(day);
          return (
            <div key={day} onClick={() => setSelDay(day)} style={{
              borderRadius: 8, padding: '5px 2px', textAlign: 'center', minHeight: 44,
              background: isToday ? T.accentGlow : 'transparent',
              border: `1px solid ${isToday ? T.accent : isSel ? T.indigo : T.border}`,
              cursor: 'pointer',
            }}>
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
          <p style={{ color: T.subtle, fontSize: 13, margin: 0 }}>
            {selDay} {base.toLocaleString('id-ID', { month: 'long' })}
          </p>
          <button onClick={() => { setModal(true); setForm({ title: '', color: '#818CF8' }); }} style={{
            background: 'transparent', color: T.accent, border: `1px solid ${T.accent}`,
            borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            display: 'flex', alignItems: 'center', gap: 4,
          }}><Plus size={13} /> Event</button>
        </div>
        {evOn(selDay).length === 0
          ? <p style={{ color: T.muted, fontSize: 13 }}>Tidak ada event. Tekan "+ Event" untuk menambah.</p>
          : evOn(selDay).map(e => (
            <div key={e.id} style={{
              background: T.card, borderRadius: 10, padding: '10px 14px', marginBottom: 8,
              border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <span style={{ color: T.text, fontSize: 14, flex: 1 }}>{e.title}</span>
              <button onClick={() => setEvents(events.filter(x => x.id !== e.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}>
                <Trash2 size={13} />
              </button>
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
              {evColors.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                  width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} />
            <SaveBtn onClick={addEvent} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── REMINDERS ────────────────────────────────────────────────────────────────
function RemindersView() {
  const [items, setItems] = useLocalStorage('fokus_reminders', [
    { id: 1, title: 'Review rencana harian', date: todayStr, time: '08:00', done: false },
    { id: 2, title: 'Refleksi malam hari', date: todayStr, time: '21:00', done: false },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: todayStr, time: '08:00' });

  const add = () => {
    if (!form.title.trim()) return;
    setItems([{ id: Date.now(), ...form, done: false }, ...items]);
    setForm({ title: '', date: todayStr, time: '08:00' });
    setModal(false);
  };

  const toggle = id => setItems(items.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const del = id => setItems(items.filter(r => r.id !== id));

  const active = items.filter(r => !r.done);
  const done = items.filter(r => r.done);

  const Card = ({ r }) => (
    <div style={{
      background: T.card, borderRadius: 12, padding: '12px 16px',
      border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12,
      opacity: r.done ? 0.4 : 1, transition: 'opacity 0.2s', marginBottom: 8,
    }}>
      <button onClick={() => toggle(r.id)} style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: r.done ? T.emerald : 'transparent',
        border: `2px solid ${r.done ? T.emerald : T.border}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {r.done && <Check size={12} color="#000" />}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: T.text, fontSize: 14, textDecoration: r.done ? 'line-through' : 'none' }}>{r.title}</p>
        <p style={{ margin: '3px 0 0', color: T.muted, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} /> {r.date} • {r.time}
        </p>
      </div>
      <button onClick={() => del(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 2 }}>
        <Trash2 size={13} />
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Pengingat" subtitle={`${active.length} pengingat aktif`} onAdd={() => setModal(true)} />
      <div style={{ paddingBottom: 100 }}>
        {active.map(r => <Card key={r.id} r={r} />)}
        {done.length > 0 && (
          <>
            <p style={{ color: T.muted, fontSize: 11, marginTop: 20, marginBottom: 8, letterSpacing: '0.5px' }}>SELESAI</p>
            {done.map(r => <Card key={r.id} r={r} />)}
          </>
        )}
        {items.length === 0 && <EmptyState icon={<Bell size={40} />} text="Belum ada pengingat" />}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Pengingat Baru">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="Judul pengingat..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ color: T.subtle, fontSize: 11, marginBottom: 6, marginTop: 0 }}>TANGGAL</p>
              <Input value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" />
            </div>
            <div>
              <p style={{ color: T.subtle, fontSize: 11, marginBottom: 6, marginTop: 0 }}>WAKTU</p>
              <Input value={form.time} onChange={v => setForm({ ...form, time: v })} type="time" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <CancelBtn onClick={() => setModal(false)} />
            <SaveBtn onClick={add} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
export default function FokusApp() {
  const [tab, setTab] = useState('notes');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (_) { } };
  }, []);

  const tabs = [
    { id: 'notes', label: 'Catatan', Icon: StickyNote },
    { id: 'todos', label: 'To-Do', Icon: CheckSquare },
    { id: 'calendar', label: 'Planner', Icon: Calendar },
    { id: 'reminders', label: 'Pengingat', Icon: Bell },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Outfit',sans-serif", color: T.text }}>

      {/* Top bar */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 20px', height: 54, display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: T.accent, letterSpacing: '-0.5px' }}>✦ Fokus</span>
          <span style={{ fontSize: 11, color: T.muted }}>productivity</span>
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: '28px 20px 0', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'notes' && <NotesView />}
        {tab === 'todos' && <TodoView />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'reminders' && <RemindersView />}
      </div>

      {/* Bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: T.surface, borderTop: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 0 20px', zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? T.accent : T.muted,
              padding: '4px 20px', transition: 'color 0.15s',
            }}>
              <div style={{
                padding: '4px 12px', borderRadius: 20,
                background: active ? T.accentGlow : 'transparent',
                transition: 'background 0.15s',
              }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: 10, fontFamily: "'Outfit',sans-serif", fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}