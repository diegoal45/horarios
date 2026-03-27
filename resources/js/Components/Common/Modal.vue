<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b">
                <h2 class="text-xl font-bold">{{ title }}</h2>
                <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            <!-- Content -->
            <div class="p-6">
                <slot />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 p-6 border-t">
                <button
                    @click="$emit('close')"
                    class="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                >
                    Cancelar
                </button>
                <button
                    @click="$emit('confirm')"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Confirmar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    isOpen: Boolean,
    title: String,
});

defineEmits(['close', 'confirm']);
</script>
