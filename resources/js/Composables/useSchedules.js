import { ref } from 'vue';
import api from '@/Utils/api';

export const useSchedules = () => {
    const schedules = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchSchedules = async () => {
        loading.value = true;
        try {
            const response = await api.get('/schedules');
            schedules.value = response.data.data;
            error.value = null;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar horarios';
        } finally {
            loading.value = false;
        }
    };

    const createSchedule = async (data) => {
        try {
            const response = await api.post('/schedules', data);
            schedules.value.push(response.data.data);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateSchedule = async (id, data) => {
        try {
            const response = await api.put(`/schedules/${id}`, data);
            const index = schedules.value.findIndex(s => s.id === id);
            if (index !== -1) {
                schedules.value[index] = response.data.data;
            }
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await api.delete(`/schedules/${id}`);
            schedules.value = schedules.value.filter(s => s.id !== id);
        } catch (err) {
            throw err;
        }
    };

    return {
        schedules,
        loading,
        error,
        fetchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
    };
};
