<template>
    <AppLayout>
        <div class="space-y-8">
            <!-- Header -->
            <div>
                <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p class="mt-2 text-gray-600">Bienvenido a tu aplicación de horarios</p>
            </div>

            <!-- Grid de Cards Responsivo -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Card 1 -->
                <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900">Horarios</h3>
                        <span class="text-3xl text-blue-600">📅</span>
                    </div>
                    <p class="mt-2 text-gray-600">Gestiona tus horarios</p>
                    <button class="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
                        Ver Horarios
                    </button>
                </div>

                <!-- Card 2 -->
                <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900">Turnos</h3>
                        <span class="text-3xl">⏰</span>
                    </div>
                    <p class="mt-2 text-gray-600">Administra los turnos</p>
                    <button class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-semibold">
                        Ver Turnos
                    </button>
                </div>

                <!-- Card 3 -->
                <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900">Usuarios</h3>
                        <span class="text-3xl">👥</span>
                    </div>
                    <p class="mt-2 text-gray-600">Gestiona usuarios y roles</p>
                    <button class="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition font-semibold">
                        Ver Usuarios
                    </button>
                </div>
            </div>

            <!-- Tabla Responsiva -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Evento</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 text-sm text-gray-700">Revisión de horarios</td>
                                <td class="px-6 py-4 text-sm text-gray-700">26 de Marzo, 2026</td>
                                <td class="px-6 py-4">
                                    <span class="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        Activo
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
</script>
