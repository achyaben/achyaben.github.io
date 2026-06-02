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

/** All dates between minDate and maxDate with availability info */
const allDates = computed(() => {
  if (!props.minDate || !props.maxDate) return [];
  const [minY, minM, minD] = props.minDate.split('-').map(Number);
  const [maxY, maxM, maxD] = props.maxDate.split('-').map(Number);
  const start = new Date(minY, minM - 1, minD);
  const end = new Date(maxY, maxM - 1, maxD);
  const result: { value: string; label: string; disabled: boolean; disabledColor: string }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const d = cursor.getDate();
    const dow = DOW_JA[cursor.getDay()];
    const value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const valid = isDateValid(cursor, props.hours);

    // Determine suffix for disabled dates
    let label = `${m}月${d}日(${dow})`;
    let disabledColor = '';
    if (!valid && props.hours) {
      const isHoliday = props.hours.holidays && props.hours.holidays.includes(value);
      label += isHoliday ? ' ー 臨時休業' : ' ー 定休日';
      disabledColor = isHoliday ? '#ef4444' : '#9ca3af'; // red-500 for holidays, gray-400 for regular
    }

    result.push({ value, label, disabled: !valid, disabledColor });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
});

/** Only the selectable dates — used for auto-select logic */
const availableDates = computed(() => allDates.value.filter((d) => !d.disabled));

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
    <option
      v-for="d in allDates"
      :key="d.value"
      :value="d.value"
      :disabled="d.disabled"
      :style="d.disabledColor ? { color: d.disabledColor } : {}"
    >
      {{ d.label }}
    </option>
  </select>
</template>
