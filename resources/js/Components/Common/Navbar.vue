<template>
    <nav class="bg-white shadow sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-blue-600">📅 Horarios</h1>
                </div>

                <!-- Links Escritorio -->
                <div class="hidden md:flex space-x-8">
                    <a href="/" class="text-gray-600 hover:text-gray-900 font-medium">Dashboard</a>
                    <a href="/schedules" class="text-gray-600 hover:text-gray-900 font-medium">Horarios</a>
                    <a href="/shifts" class="text-gray-600 hover:text-gray-900 font-medium">Turnos</a>
                    <a href="/users" class="text-gray-600 hover:text-gray-900 font-medium">Usuarios</a>
                </div>

                <!-- Usuario -->
                <div class="flex items-center space-x-4">
                    <span class="text-gray-700 font-medium hidden sm:inline">{{ userName }}</span>
                    <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
defineProps({
    userName: {
        type: String,
        default: 'Usuario',
    },
});
</script>
