<template>
    <button
        :class="[
            'px-4 py-2 rounded font-semibold transition',
            variantClasses,
            sizeClasses,
            { 'opacity-50 cursor-not-allowed': disabled }
        ]"
        :disabled="disabled"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>

<script setup>
const props = defineProps({
    variant: {
        type: String,
        default: 'primary', // primary, secondary, danger
    },
    size: {
        type: String,
        default: 'md', // sm, md, lg
    },
    disabled: Boolean,
});

const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
}[props.variant];

const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
}[props.size];
</script>
