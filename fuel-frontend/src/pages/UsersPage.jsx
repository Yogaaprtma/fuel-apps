import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Edit2, Trash2, X, Search, Shield, ToggleLeft, ToggleRight, AlertTriangle, User } from 'lucide-react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';
import useTheme from '../hooks/useTheme';

const ROLES = ['super-admin', 'admin-operasional', 'driver', 'customer'];

const ROLE_CONFIG = {
  'super-admin':       { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Super Admin' },
  'admin-operasional': { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: 'Admin Ops' },
  'driver':            { color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: 'Driver' },
  'customer':          { color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', label: 'Customer' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'driver' };

// Ambil 1-2 inisial dari nama user
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

// Avatar: tampilkan foto jika ada, fallback ke inisial berwarna sesuai role
function UserAvatar({ user, roleCfg, size = 8 }) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = user.avatar_url && user.avatar_url !== 'null' && user.avatar_url !== 'undefined';
  const initials = getInitials(user.name);

  const px = size * 4; // tailwind size ke pixel (w-8 = 32px)
  const fontSize = size <= 8 ? '11px' : '14px';

  if (hasPhoto && !imgError) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        onError={() => setImgError(true)}
        className={`w-${size} h-${size} rounded-xl object-cover flex-shrink-0`}
        style={{ border: '2px solid #E2E8F0' }}
      />
    );
  }

  return (
    <div
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center flex-shrink-0 font-bold select-none`}
      style={{
        background: roleCfg?.bg ?? '#EFF6FF',
        color: roleCfg?.color ?? '#2563EB',
        border: `2px solid ${roleCfg?.border ?? '#BFDBFE'}`,
        fontSize,
        letterSpacing: '0.03em',
      }}
    >
      {initials || <User size={size <= 8 ? 14 : 18} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Custom Confirm Dialog — pengganti native confirm()
// ─────────────────────────────────────────────
function ConfirmDialog({ open, title, message, userName, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm animate-scale-in">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          {/* Top strip merah */}
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #EF4444, #F87171)' }} />

          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#FEF2F2', border: '2px solid #FECACA' }}>
                <Trash2 size={28} style={{ color: '#DC2626' }} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>
                {title ?? 'Hapus User?'}
              </h3>
              {userName && (
                <p className="text-sm font-semibold mb-2" style={{ color: '#2563EB' }}>
                  &ldquo;{userName}&rdquo;
                </p>
              )}
              <p className="text-sm" style={{ color: '#64748B' }}>
                {message ?? 'Tindakan ini tidak dapat dibatalkan. Data user akan dihapus secara permanen.'}
              </p>
            </div>

            {/* Warning note */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5"
              style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <AlertTriangle size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
              <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                Semua data terkait user ini juga akan ikut terhapus.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1.5px solid #E2E8F0',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: loading ? '#FCA5A5' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  boxShadow: loading ? 'none' : '0 2px 8px rgba(220,38,38,0.35)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.45)')}
                onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,38,38,0.35)')}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Menghapus...</> : <><Trash2 size={15} /> Ya, Hapus</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function UsersPage() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  // State confirm dialog delete
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null, userName: '', deleting: false });
  const { isDark } = useTheme();

  const openConfirm  = (user) => setConfirmDialog({ open: true, userId: user.id, userName: user.name, deleting: false });
  const closeConfirm = ()    => setConfirmDialog({ open: false, userId: null, userName: '', deleting: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.list({ search });
      setUsers(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.roles?.[0]?.name || 'driver' });
    setModal(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await userApi.create(form);
        toast.success('User berhasil dibuat!');
      } else {
        await userApi.update(modal.id, form);
        toast.success('User berhasil diperbarui!');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDialog(prev => ({ ...prev, deleting: true }));
    try {
      await userApi.delete(confirmDialog.userId);
      toast.success(`User "${confirmDialog.userName}" berhasil dihapus`);
      closeConfirm();
      fetchUsers();
    } catch {
      toast.error('Gagal menghapus user');
      setConfirmDialog(prev => ({ ...prev, deleting: false }));
    }
  };

  const handleToggle = async (u) => {
    try {
      await userApi.update(u.id, { is_active: !u.is_active });
      fetchUsers();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">{users.length} pengguna terdaftar</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="create-user">
          <Plus size={17} /> Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" className="input pl-11"
          placeholder="Cari nama atau email..."
          value={search} onChange={e => setSearch(e.target.value)}
          id="search-users" />
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Pengguna', 'Role', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    {[160, 80, 60, 80].map((w, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                      <Users size={26} style={{ color: isDark ? '#475569' : '#CBD5E1' }} />
                    </div>
                    <p className="text-sm" style={{ color: isDark ? '#94A3B8' : '#94A3B8' }}>Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : filteredUsers.map(u => {
                const roleName  = u.roles?.[0]?.name;
                const roleCfg   = ROLE_CONFIG[roleName] ?? ROLE_CONFIG.customer;
                return (
                  <tr key={u.id} className="table-row group">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} roleCfg={roleCfg} size={8} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#94A3B8' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}>
                        <Shield size={9} />
                        {roleCfg.label}
                      </span>
                    </td>
                    <td className="table-td">
                      <button onClick={() => handleToggle(u)}
                        className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                        id={`toggle-user-${u.id}`}>
                        {u.is_active
                          ? <><ToggleRight size={18} className="text-emerald-500" /> <span className="text-emerald-600">Aktif</span></>
                          : <><ToggleLeft size={18} className="text-red-400" /> <span className="text-red-500">Nonaktif</span></>
                        }
                      </button>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)}
                          className="p-2 rounded-lg transition-all text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          id={`edit-user-${u.id}`}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => openConfirm(u)}
                          className="p-2 rounded-lg transition-all text-slate-400 hover:text-red-500 hover:bg-red-50"
                          id={`delete-user-${u.id}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 px-4 pt-4 pb-24 sm:p-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="w-full max-w-md animate-slide-up overflow-y-auto max-h-[80vh] sm:max-h-[90vh] rounded-2xl">
            <div className="card rounded-2xl" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-base" style={{ color: '#0F172A' }}>
                  {modal === 'create' ? 'Tambah User Baru' : 'Edit User'}
                </h2>
                <button onClick={() => setModal(null)} className="btn-ghost p-1.5" id="close-modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { field: 'name',  label: 'Nama Lengkap', type: 'text',  required: true },
                  { field: 'email', label: 'Email',         type: 'email', required: modal === 'create', disabled: modal !== 'create' },
                  { field: 'phone', label: 'Nomor HP',      type: 'tel' },
                ].map(({ field, label, type, required, disabled }) => (
                  <div key={field}>
                    <label className="label">{label}</label>
                    <input className={`input ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                      type={type} value={form[field]} required={required} disabled={disabled}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      id={`modal-${field}`} />
                  </div>
                ))}

                <div>
                  <label className="label">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => {
                      const cfg = ROLE_CONFIG[r];
                      return (
                        <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))}
                          className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                          id={`role-${r}`}
                          style={form.role === r
                            ? { background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }
                            : { background: '#F8FAFC', color: '#64748B', border: '1.5px solid #E2E8F0' }
                          }>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">
                    Password{' '}
                    {modal !== 'create' && (
                      <span className="text-slate-400 font-normal text-xs">(kosongkan jika tidak diubah)</span>
                    )}
                  </label>
                  <input className="input" type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required={modal === 'create'} minLength={8}
                    placeholder={modal === 'create' ? 'Min. 8 karakter' : '••••••••'}
                    id="modal-password" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">
                    Batal
                  </button>
                  <button type="submit" className="btn-primary flex-1" disabled={submitting} id="submit-user">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Menyimpan...' : modal === 'create' ? 'Buat User' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        userName={confirmDialog.userName}
        loading={confirmDialog.deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}