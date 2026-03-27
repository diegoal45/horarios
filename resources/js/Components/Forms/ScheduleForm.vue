<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <Input 
            v-model="form.name" 
            placeholder="Nombre del horario" 
            :error="errors.name"
        />
        
        <Input 
            v-model="form.description" 
            placeholder="Descripción" 
            :error="errors.description"
        />
        
        <Input 
            v-model="form.start_date" 
            type="date" 
            :error="errors.start_date"
        />
        
        <Input 
            v-model="form.end_date" 
            type="date" 
            :error="errors.end_date"
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
    schedule: Object,
    loading: Boolean,
    isEdit: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
});

const errors = ref({});

watch(() => props.schedule, (newSchedule) => {
    if (newSchedule) {
        form.value = { ...newSchedule };
    }
}, { immediate: true });

const handleSubmit = () => {
    errors.value = {};
    emit('submit', form.value);
};
</script>
