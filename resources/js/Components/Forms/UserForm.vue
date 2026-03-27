<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <Input 
            v-model="form.name" 
            placeholder="Nombre" 
            :error="errors.name"
        />
        
        <Input 
            v-model="form.email" 
            type="email"
            placeholder="Email" 
            :error="errors.email"
        />
        
        <Input 
            v-model="form.password" 
            type="password"
            placeholder="Contraseña" 
            :error="errors.password"
        />

        <div class="flex gap-2">
            <Button type="submit" variant="primary" :disabled="loading">
                {{ isEdit ? 'Actualizar' : 'Crear' }}
            </Button>
            <Button type="button" variant="secondary" @click="$emit('cancel')">
                Cancelar
            </Button>
        </div>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import Input from '@/Components/UI/Input.vue';
import Button from '@/Components/UI/Button.vue';

const props = defineProps({
    user: Object,
    loading: Boolean,
    isEdit: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
    name: '',
    email: '',
    password: '',
});

const errors = ref({});

watch(() => props.user, (newUser) => {
    if (newUser) {
        form.value = { ...newUser };
    }
}, { immediate: true });

const handleSubmit = () => {
    errors.value = {};
    emit('submit', form.value);
};
</script>
