import { ref } from 'vue';
import api from '@/Utils/api';

export const useUsers = () => {
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchUsers = async () => {
        loading.value = true;
        try {
            const response = await api.get('/users');
            users.value = response.data.data;
            error.value = null;
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar usuarios';
        } finally {
            loading.value = false;
        }
    };

    const createUser = async (data) => {
        try {
            const response = await api.post('/users', data);
            users.value.push(response.data.data);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const updateUser = async (id, data) => {
        try {
            const response = await api.put(`/users/${id}`, data);
            const index = users.value.findIndex(u => u.id === id);
            if (index !== -1) {
                users.value[index] = response.data.data;
            }
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            users.value = users.value.filter(u => u.id !== id);
        } catch (err) {
            throw err;
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    };
};
