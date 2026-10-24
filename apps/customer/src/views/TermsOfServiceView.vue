<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <header class="sticky top-0 bg-white shadow-sm z-50">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <button @click="$router.back()" class="text-gray-600 hover:text-gray-900 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 class="text-lg font-bold">{{ SYSTEM_STATUS_TEXT.termsOfService.title }}</h1>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="bg-white rounded-xl p-6 shadow-sm mb-4">
        <p class="text-sm text-gray-500">
          最終更新日：{{ SYSTEM_STATUS_TEXT.termsOfService.lastUpdated }}
        </p>
      </div>

      <div class="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
        <h3 class="font-bold text-blue-900 mb-2">📋 本サービスについて</h3>
        <p class="text-sm text-blue-800">
          「あちゃーべん」は、法人様向けオンライン注文システムです。企業・団体様の社員弁当やケータリングのご注文を効率的に管理いただけます。
        </p>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <section
          v-for="(section, index) in SYSTEM_STATUS_TEXT.termsOfService.sections"
          :key="index"
          class="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
        >
          <h2 class="text-xl font-bold text-gray-900 mb-3">{{ index + 1 }}. {{ section.title }}</h2>
          <p class="text-gray-600 leading-relaxed mb-2">{{ section.content }}</p>
          <ul v-if="section.list" class="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li v-for="(item, i) in section.list" :key="i" class="leading-relaxed">{{ item }}</li>
          </ul>
          <p
            v-if="section.note"
            class="text-sm text-amber-800 mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200"
          >
            {{ section.note }}
          </p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { SYSTEM_STATUS_TEXT } from '../constants/system-status-text';
</script>
