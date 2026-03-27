<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Navbar -->
        <Navbar userName="Diego" />

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </div>
    </div>
</template>

<script setup>
import Navbar from '@/Components/Common/Navbar.vue';
</script>
