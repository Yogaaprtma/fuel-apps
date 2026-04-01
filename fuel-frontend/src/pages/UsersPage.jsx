import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Edit, Trash2, X } from 'lucide-react';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = ['super-admin','admin-operasional','driver','customer'];
const ROLE_COLORS = {
  'super-admin': 'bg-purple-900 text-purple-300',
  'admin-operasional': 'bg-blue-900 text-blue-300',
  'driver': 'bg-amber-900 text-amber-300',
  'customer': 'bg-emerald-900 text-emerald-300',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'create' | user object
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'driver' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.list();
      setUsers(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm({ name: '', email: '', phone: '', password: '', role: 'driver' }); setModal('create'); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.roles?.[0]?.name || 'driver' });
    setModal(u);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        await userApi.create(form);
        toast.success('User berhasil dibuat');
      } else {
        await userApi.update(modal.id, form);
        toast.success('User berhasil diupdate');
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus user ini?')) return;
    try {
      await userApi.delete(id);
      toast.success('User dihapus');
      fetchUsers();
    } catch { toast.error('Gagal menghapus'); }
  };

  const handleToggleActive = async (u) => {
    await userApi.update(u.id, { is_active: !u.is_active });
    fetchUsers();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Manajemen User</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-flame" /></div>
      ) : (
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50">
                <tr>
                  {['Nama', 'Email', 'Role', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-white font-medium text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`status-badge ${ROLE_COLORS[u.roles?.[0]?.name] || 'bg-slate-700 text-slate-300'}`}>
                        {u.roles?.[0]?.name || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleActive(u)}
                        className={`status-badge cursor-pointer ${u.is_active ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">{modal === 'create' ? 'Tambah User Baru' : 'Edit User'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Nama *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required={modal === 'create'} disabled={modal !== 'create'} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Nomor HP</label>
                <input className="input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Role *</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Password {modal !== 'create' && <span className="text-slate-600">(kosongkan jika tidak diubah)</span>}
                </label>
                <input className="input" type="password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required={modal === 'create'} minLength={8} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1">
                  {modal === 'create' ? 'Buat User' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}