<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Restaurant Settings</h1>
    <p>Update your restaurant's settings here.</p>
    <form @submit.prevent="saveSettings" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Restaurant Name</label>
        <input v-model="settings.name" type="text" id="name"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          required />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea v-model="settings.description" id="description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          rows="4"></textarea>
      </div>
      <div>
        <label for="banner" class="block text-sm font-medium text-gray-700">Banner</label>
        <input type="file" id="banner" @change="uploadBanner"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <p v-if="settings.banner" class="mt-2 text-sm text-gray-500">
          Current Banner: {{ settings.banner }}
        </p>
      </div>
      <div class="flex justify-end gap-2">
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
      </div>
    </form>

    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-2">Printer Configuration</h2>
      <div class="mb-4">
        <label for="printerName" class="block text-sm font-medium text-gray-700">Printer Name</label>
        <input v-model="printerConfig.printerName" type="text" id="printerName"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
      </div>
      <div class="mb-4">
        <label for="paperSize" class="block text-sm font-medium text-gray-700">Paper Size</label>
        <select v-model="printerConfig.paperSize" id="paperSize"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>
      </div>
      <button @click="savePrinterConfig" class="px-4 py-2 bg-blue-500 text-white rounded">
        Save Printer Configuration
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface RestaurantSettings {
  name: string;
  description: string;
  banner: string | null;
}

const settings = ref<RestaurantSettings>({
  name: 'Restaurant App',
  description: 'Delicious Japanese Bento Boxes',
  banner: null,
});

const saveSettings = () => {
  alert('Settings have been successfully saved!');
};

const uploadBanner = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      settings.value.banner = reader.result as string;
      alert('Banner uploaded successfully!');
    };
    reader.readAsDataURL(file);
  }
};

const printerConfig = ref({
  printerName: '',
  paperSize: 'A4',
});

const savePrinterConfig = () => {
  alert(`Printer configuration saved: ${JSON.stringify(printerConfig.value)}`);
};
</script>

<style scoped>
/* Add scoped styles here */
</style>
