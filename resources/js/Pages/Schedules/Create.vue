<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Crear Horario</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <ScheduleForm 
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
import ScheduleForm from '@/Components/Forms/ScheduleForm.vue';
import { useSchedules } from '@/Composables/useSchedules';

const loading = ref(false);
const { createSchedule } = useSchedules();

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await createSchedule(formData);
        alert('Horario creado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al crear horario');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/schedules';
};
</script>
