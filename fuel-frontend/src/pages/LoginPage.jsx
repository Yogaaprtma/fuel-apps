import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Selamat datang!');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-flame/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-sm relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 bg-flame rounded-2xl items-center justify-center mb-4 shadow-2xl shadow-flame/40">
                        <Fuel size={32} className="text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white">Fuel DS</h1>
                    <p className="text-slate-500 mt-1">Fuel Delivery System</p>
                </div>

                {/* Form */}
                <div className="card animate-slide-up">
                    <h2 className="text-lg font-semibold text-white mb-6">Masuk ke Akun</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                            <input type="email" className="input" placeholder="email@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} className="input pr-12"
                                    placeholder="••••••••" value={password}
                                    onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-600 text-center mb-3">Demo accounts (password: password)</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Super Admin', email: 'superadmin@fds.com' },
                                { label: 'Admin Ops', email: 'admin@fds.com' },
                                { label: 'Driver', email: 'driver1@fds.com' },
                                { label: 'Customer', email: 'customer@fds.com' },
                            ].map(acc => (
                                <button key={acc.email} type="button"
                                    onClick={() => { setEmail(acc.email); setPassword('password'); }}
                                    className="text-xs text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all">
                                    <span className="text-slate-400 block">{acc.label}</span>
                                    <span className="text-slate-600 truncate block">{acc.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}