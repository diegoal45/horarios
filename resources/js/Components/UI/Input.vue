<template>
    <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="[
            'w-full px-4 py-2 border border-gray-300 rounded',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            { 'border-red-500': error }
        ]"
        v-bind="$attrs"
    />
    <span v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</span>
</template>

<script setup>
defineProps({
    type: {
        type: String,
        default: 'text',
    },
    placeholder: String,
    modelValue: [String, Number],
    error: String,
});

defineEmits(['update:modelValue']);
</script>
