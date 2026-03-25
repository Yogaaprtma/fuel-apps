import { create } from 'zustand';
import { deliveryApi } from '../services/api';

const useDeliveryStore = create((set, get) => ({
    deliveries: [],
    current: null,
    stats: null,
    loading: false,
    pagination: null,

    fetchDeliveries: async (params = {}) => {
        set({ loading: true });
        try {
            const { data } = await deliveryApi.list(params);
            set({ deliveries: data.data, pagination: data, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    fetchDelivery: async (id) => {
        set({ loading: true });
        try {
            const { data } = await deliveryApi.get(id);
            set({ current: data, loading: false });
            return data;
        } catch {
            set({ loading: false });
        }
    },

    fetchStats: async () => {
        try {
            const { data } = await deliveryApi.statistics();
            set({ stats: data });
        } catch {

        }
    },

    createDelivery: async (formData) => {
        const { data } = await deliveryApi.create(formData);
        set(state => ({ deliveries: [data, ...state.deliveries] }));
        return data;
    },

    updateStatus: async (id, statusData) => {
        const { data } = await deliveryApi.updateStatus(id, statusData);
        set(state => ({
            deliveries: state.deliveries.map(d => d.id === id ? { ...d, status: data.delivery.status } : d),
            current: state.current?.id === id ? data.delivery : state.current,
        }));
        return data;
    },
}));

export default useDeliveryStore;