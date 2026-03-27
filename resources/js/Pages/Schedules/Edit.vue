<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Editar Horario</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <ScheduleForm 
                    :schedule="schedule"
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
import ScheduleForm from '@/Components/Forms/ScheduleForm.vue';
import { useSchedules } from '@/Composables/useSchedules';
import api from '@/Utils/api';

const schedule = ref(null);
const loading = ref(false);
const { updateSchedule } = useSchedules();

// Obtener parámetro de URL
const scheduleId = new URLSearchParams(window.location.search).get('id');

onMounted(async () => {
    try {
        const response = await api.get(`/schedules/${scheduleId}`);
        schedule.value = response.data.data;
    } catch (error) {
        alert('Error al cargar el horario');
    }
});

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await updateSchedule(scheduleId, formData);
        alert('Horario actualizado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al actualizar horario');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/schedules';
};
</script>
