<script setup lang="ts">
import { computed, watch } from 'vue';
import { isDateValid, type DateValidationHours } from '../utils/date';

const props = defineProps<{
  modelValue: string;
  minDate: string;
  maxDate: string;
  hours?: DateValidationHours;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土'];

/** All valid selectable dates between minDate and maxDate, as { value: 'YYYY-MM-DD', label: '6月1日(月)' } */
const availableDates = computed(() => {
  if (!props.minDate || !props.maxDate) return [];
  const [minY, minM, minD] = props.minDate.split('-').map(Number);
  const [maxY, maxM, maxD] = props.maxDate.split('-').map(Number);
  const start = new Date(minY, minM - 1, minD);
  const end = new Date(maxY, maxM - 1, maxD);
  const result: { value: string; label: string }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    if (isDateValid(cursor, props.hours)) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const d = cursor.getDate();
      const dow = DOW_JA[cursor.getDay()];
      const value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ value, label: `${m}月${d}日(${dow})` });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
});

// Auto-select the first available date if nothing is selected
watch(
  availableDates,
  (dates) => {
    if (dates.length && !props.modelValue) {
      emit('update:modelValue', dates[0].value);
    }
  },
  { immediate: true }
);

// Handle external reset (parent clears modelValue to '')
watch(
  () => props.modelValue,
  (val) => {
    if (!val && availableDates.value.length) {
      emit('update:modelValue', availableDates.value[0].value);
    }
  }
);

function onSelect(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value);
}
</script>

<template>
  <select
    :value="modelValue"
    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
    @change="onSelect"
  >
    <option v-for="d in availableDates" :key="d.value" :value="d.value">{{ d.label }}</option>
  </select>
</template>
