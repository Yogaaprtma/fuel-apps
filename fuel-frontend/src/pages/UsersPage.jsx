import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Edit2, Trash2, X, Search, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = ['super-admin', 'admin-operasional', 'driver', 'customer'];

const ROLE_CONFIG = {
  'super-admin':       { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', label: 'Super Admin' },
  'admin-operasional': { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  label: 'Admin Ops' },
  'driver':            { color: '#fb923c', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  label: 'Driver' },
  'customer':          { color: '#4ade80', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   label: 'Customer' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'driver' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.list({ search });
      setUsers(data.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.roles?.[0]?.name || 'driver' });
    setModal(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'create') { await userApi.create(form); toast.success('User berhasil dibuat!'); }
      else { await userApi.update(modal.id, form); toast.success('User berhasil diupdate!'); }
      setModal(null); fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try { await userApi.delete(id); toast.success('User dihapus'); fetchUsers(); }
    catch { toast.error('Gagal menghapus user'); }
  };

  const handleToggle = async (u) => {
    try { await userApi.update(u.id, { is_active: !u.is_active }); fetchUsers(); }
    catch { toast.error('Gagal mengubah status'); }
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
          <p className="page-subtitle">{users.length} user terdaftar</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="create-user">
          <Plus size={17} /> Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a6080' }} />
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
              <tr style={{ borderBottom: '1px solid rgba(30,45,66,0.8)' }}>
                {['Pengguna', 'Role', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: '#4a6080' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded" style={{ width: j === 1 ? '140px' : j === 2 ? '80px' : j === 3 ? '60px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <Users size={32} className="mx-auto mb-2" style={{ color: '#2a3f5a' }} />
                    <p className="text-sm" style={{ color: '#4a6080' }}>Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : filteredUsers.map(u => {
                const roleName = u.roles?.[0]?.name;
                const roleConfig = ROLE_CONFIG[roleName] ?? ROLE_CONFIG.customer;
                return (
                  <tr key={u.id} className="transition-colors group"
                    style={{ borderBottom: '1px solid rgba(30,45,66,0.4)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,45,66,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url} alt={u.name}
                          className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                          style={{ border: '1px solid rgba(30,45,66,0.8)' }} />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{u.name}</p>
                          <p className="text-xs" style={{ color: '#4a6080' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: roleConfig.bg, color: roleConfig.color, border: `1px solid ${roleConfig.border}` }}>
                        <Shield size={9} />
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleToggle(u)}
                        className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                        style={{ color: u.is_active ? '#4ade80' : '#f87171' }}
                        id={`toggle-user-${u.id}`}>
                        {u.is_active
                          ? <><ToggleRight size={18} style={{ color: '#4ade80' }} /> Aktif</>
                          : <><ToggleLeft size={18} style={{ color: '#f87171' }} /> Nonaktif</>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: '#4a6080' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#4a6080'; e.currentTarget.style.background = ''; }}
                          id={`edit-user-${u.id}`}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: '#4a6080' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#4a6080'; e.currentTarget.style.background = ''; }}
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
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4"
          style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="w-full max-w-md animate-slide-up">
            <div className="card">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-text-primary">
                  {modal === 'create' ? 'Tambah User Baru' : 'Edit User'}
                </h2>
                <button onClick={() => setModal(null)} className="btn-ghost p-1.5" id="close-modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { field: 'name', label: 'Nama Lengkap', type: 'text', required: true },
                  { field: 'email', label: 'Email', type: 'email', required: modal === 'create', disabled: modal !== 'create' },
                  { field: 'phone', label: 'Nomor HP', type: 'tel' },
                ].map(({ field, label, type, required, disabled }) => (
                  <div key={field}>
                    <label className="label">{label}</label>
                    <input className={`input ${disabled ? 'opacity-50' : ''}`} type={type}
                      value={form[field]} required={required} disabled={disabled}
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
                          className="py-2 rounded-xl text-xs font-semibold transition-all border"
                          id={`role-${r}`}
                          style={form.role === r ? {
                            background: cfg.bg, color: cfg.color, borderColor: cfg.border,
                          } : {
                            background: 'rgba(30,45,66,0.4)', color: '#4a6080', borderColor: 'rgba(30,45,66,0.8)',
                          }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">
                    Password {modal !== 'create' && <span style={{ color: '#4a6080', fontWeight: 400 }}>(kosongkan jika tidak diubah)</span>}
                  </label>
                  <input className="input" type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required={modal === 'create'} minLength={8}
                    placeholder={modal === 'create' ? 'Min. 8 karakter' : '••••••••'}
                    id="modal-password" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Batal</button>
                  <button type="submit" className="btn-primary flex-1" disabled={submitting} id="submit-user">
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                    {submitting ? 'Menyimpan...' : modal === 'create' ? 'Buat User' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}