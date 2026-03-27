<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Editar Usuario</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <UserForm 
                    :user="user"
                    :loading="loading"
                    :is-edit="true"
                    @submit="handleSubmit"
                    @cancel="goBack"
                />
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import UserForm from '@/Components/Forms/UserForm.vue';
import { useUsers } from '@/Composables/useUsers';
import api from '@/Utils/api';

const user = ref(null);
const loading = ref(false);
const { updateUser } = useUsers();

const userId = new URLSearchParams(window.location.search).get('id');

onMounted(async () => {
    try {
        const response = await api.get(`/users/${userId}`);
        user.value = response.data.data;
    } catch (error) {
        alert('Error al cargar el usuario');
    }
});

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await updateUser(userId, formData);
        alert('Usuario actualizado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al actualizar usuario');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/users';
};
</script>
