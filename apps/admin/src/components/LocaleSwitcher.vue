<template>
  <div class="flex items-center gap-1 text-sm select-none">
    <button
      @click="switchLocale('en')"
      :class="currentLocale === 'en' ? 'font-bold underline' : 'opacity-50 hover:opacity-80'"
      class="transition-opacity"
    >
      EN
    </button>
    <span class="opacity-40">|</span>
    <button
      @click="switchLocale('ja')"
      :class="currentLocale === 'ja' ? 'font-bold underline' : 'opacity-50 hover:opacity-80'"
      class="transition-opacity"
    >
      日本語
    </button>
    <span class="opacity-40">|</span>
    <button
      @click="switchLocale('ne')"
      :class="currentLocale === 'ne' ? 'font-bold underline' : 'opacity-50 hover:opacity-80'"
      class="transition-opacity"
    >
      नेपाली
    </button>
  </div>
</template>

<script setup lang="ts">
import { currentLocale, setLocale, type Locale } from '../constants/ui-texts';
// currentLocale is a ref — access .value in script, bare in template

function switchLocale(locale: Locale) {
  if (currentLocale.value !== locale) setLocale(locale);
}
</script>
