<template>
    <AppLayout>
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900">Turnos</h2>
                    <p class="text-gray-600 mt-1">Administra todos los turnos</p>
                </div>
                <a href="/shifts/create" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
                    + Nuevo Turno
                </a>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="text-center py-12">
                <p class="text-gray-600">Cargando turnos...</p>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {{ error }}
            </div>

            <!-- Table -->
            <div v-if="!loading && shifts.length" class="bg-white rounded-lg shadow">
                <Table 
                    :columns="columns" 
                    :rows="shifts"
                    :has-actions="true"
                >
                    <template #actions="{ row }">
                        <a :href="`/shifts/${row.id}/edit`" class="text-blue-600 hover:text-blue-900 font-medium">
                            Editar
                        </a>
                        <button @click="deleteItem(row.id)" class="text-red-600 hover:text-red-900 font-medium">
                            Eliminar
                        </button>
                    </template>
                </Table>
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading" class="text-center py-12">
                <p class="text-gray-600">No hay turnos disponibles</p>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import Table from '@/Components/UI/Table.vue';
import { useShifts } from '@/Composables/useShifts';

const { shifts, loading, error, fetchShifts, deleteShift } = useShifts();

const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'start_time', label: 'Hora de inicio' },
    { key: 'end_time', label: 'Hora de fin' },
];

onMounted(() => {
    fetchShifts();
});

const deleteItem = async (id) => {
    if (confirm('¿Estás seguro?')) {
        try {
            await deleteShift(id);
        } catch (err) {
            alert('Error al eliminar');
        }
    }
};
</script>
