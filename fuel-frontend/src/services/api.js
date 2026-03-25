import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Auto-attach token dari localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fds_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-redirect ke login jika 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('fds_token');
            localStorage.removeItem('fds_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const authApi = {
    login:  (data)    => api.post('/auth/login', data),
    logout: ()        => api.post('/auth/logout'),
    me:     ()        => api.get('/auth/me'),
    update: (data)    => api.post('/auth/profile', data),
};

export const deliveryApi = {
    list:       (params) => api.get('/deliveries', { params }),
    get:        (id)     => api.get(`/deliveries/${id}`),
    create:     (data)   => api.post('/deliveries', data),
    update:     (id, d)  => api.put(`/deliveries/${id}`, d),
    delete:     (id)     => api.delete(`/deliveries/${id}`),
    statistics: ()       => api.get('/statistics'),
    publicTrack:(code)   => api.get('/track', { params: { code } }),
    updateStatus:(id, d) => api.patch(`/deliveries/${id}/status`, d),
};

export const trackingApi = {
    send:    (id, data) => api.post(`/deliveries/${id}/track`, data),
    history: (id)       => api.get(`/deliveries/${id}/track`),
};

export const photoApi = {
    upload: (id, data) => api.post(`/deliveries/${id}/photos`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (deliveryId, photoId) => api.delete(`deliveries/${deliveryId}/photos/${photoId}`),
};

export const proofApi = {
    submit: (id, data) => api.post(`/deliveries/${id}/proof`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    get:    (id)       => api.get(`/deliveries/${id}/proof`),
};

export const userApi = {
    list:    (params) => api.get('/users', { params }),
    drivers: ()       => api.get('/drivers'),
    create:  (data)   => api.post('/users', data),
    update:  (id, d)  => api.put(`/users/${id}`, d),
    delete:  (id)     => api.delete(`/users/${id}`),
};

export default api;