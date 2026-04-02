import { create } from 'zustand';
import { authApi } from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('fds_user') || 'null'),
    token: localStorage.getItem('fds_token') || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ 
            loading: true, 
            error: null 
        });
        try {
            const { data } = await authApi.login({ email, password });
            localStorage.setItem('fds_token', data.token);
            localStorage.setItem('fds_user', JSON.stringify(data.user));
            set({ 
                user: data.user, 
                token: data.token, 
                loading: false 
            });
            return data.user;
        } catch (err) {
            const msg = err.response?.data?.message || 'Login gagal';
            set({ 
                error: msg, 
                loading: false 
            });
            throw new Error(msg);
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch {

        }
        localStorage.removeItem('fds_token');
        localStorage.removeItem('fds_user');
        set({ 
            user: null, 
            token: null 
        });
    },

    hasRole: (role) => {
        const user = useAuthStore.getState().user;
        if (!user?.roles) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.some(r => user.roles.includes(r));
    },
}));

export default useAuthStore;