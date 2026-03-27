<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Crear Usuario</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <UserForm 
                    :loading="loading"
                    @submit="handleSubmit"
                    @cancel="goBack"
                />
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import UserForm from '@/Components/Forms/UserForm.vue';
import { useUsers } from '@/Composables/useUsers';

const loading = ref(false);
const { createUser } = useUsers();

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await createUser(formData);
        alert('Usuario creado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al crear usuario');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/users';
};
</script>
