<template>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-100 border-b">
                <tr>
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                    >
                        {{ column.label }}
                    </th>
                    <th v-if="hasActions" class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="row in rows" :key="row.id" class="hover:bg-gray-50">
                    <td
                        v-for="column in columns"
                        :key="column.key"
                        class="px-6 py-4 text-sm text-gray-700"
                    >
                        {{ row[column.key] }}
                    </td>
                    <td v-if="hasActions" class="px-6 py-4 text-sm space-x-2">
                        <slot name="actions" :row="row" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    columns: {
        type: Array,
        required: true,
    },
    rows: {
        type: Array,
        required: true,
    },
    hasActions: Boolean,
});
</script>
