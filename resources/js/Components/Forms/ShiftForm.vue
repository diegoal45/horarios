<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <Input 
            v-model="form.name" 
            placeholder="Nombre del turno" 
            :error="errors.name"
        />
        
        <Input 
            v-model="form.start_time" 
            type="time" 
            :error="errors.start_time"
        />
        
        <Input 
            v-model="form.end_time" 
            type="time" 
            :error="errors.end_time"
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
    shift: Object,
    loading: Boolean,
    isEdit: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
    name: '',
    start_time: '',
    end_time: '',
});

const errors = ref({});

watch(() => props.shift, (newShift) => {
    if (newShift) {
        form.value = { ...newShift };
    }
}, { immediate: true });

const handleSubmit = () => {
    errors.value = {};
    emit('submit', form.value);
};
</script>
