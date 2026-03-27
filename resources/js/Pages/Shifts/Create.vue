<template>
    <AppLayout>
        <div class="max-w-2xl">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Crear Turno</h2>
            
            <div class="bg-white rounded-lg shadow p-6">
                <ShiftForm 
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
import ShiftForm from '@/Components/Forms/ShiftForm.vue';
import { useShifts } from '@/Composables/useShifts';

const loading = ref(false);
const { createShift } = useShifts();

const handleSubmit = async (formData) => {
    loading.value = true;
    try {
        await createShift(formData);
        alert('Turno creado exitosamente');
        goBack();
    } catch (error) {
        alert('Error al crear turno');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    window.location.href = '/shifts';
};
</script>
