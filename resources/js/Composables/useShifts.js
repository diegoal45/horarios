import { ref } from 'vue';
import api from '@/Utils/api';

export const useShifts = () => {
    const shifts = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchShifts = async () => {
        loading.value = true;
        try {
            const response = await api.get('/shifts');
            shifts.value = response.data.data;
            error.value = null;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar turnos';
        } finally {
            loading.value = false;
        }
    };

    const createShift = async (data) => {
        try {
            const response = await api.post('/shifts', data);
            shifts.value.push(response.data.data);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateShift = async (id, data) => {
        try {
            const response = await api.put(`/shifts/${id}`, data);
            const index = shifts.value.findIndex(s => s.id === id);
            if (index !== -1) {
                shifts.value[index] = response.data.data;
            }
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteShift = async (id) => {
        try {
            await api.delete(`/shifts/${id}`);
            shifts.value = shifts.value.filter(s => s.id !== id);
        } catch (err) {
            throw err;
        }
    };

    return {
        shifts,
        loading,
        error,
        fetchShifts,
        createShift,
        updateShift,
        deleteShift,
    };
};
