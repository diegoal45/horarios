<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Editar Turno</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <ShiftForm 
                    :shift="shift"
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
import ShiftForm from '@/Components/Forms/ShiftForm.vue';
import { useShifts } from '@/Composables/useShifts';
import api from '@/Utils/api';

const shift = ref(null);
const loading = ref(false);
const { updateShift } = useShifts();

const shiftId = new URLSearchParams(window.location.search).get('id');

onMounted(async () => {
    try {
        const response = await api.get(`/shifts/${shiftId}`);
        shift.value = response.data.data;
    } catch (error) {
        alert('Error al cargar el turno');
    }
});

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await updateShift(shiftId, formData);
        alert('Turno actualizado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al actualizar turno');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/shifts';
};
</script>
