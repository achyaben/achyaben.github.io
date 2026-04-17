<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ UI_TEXTS.settings.title }}</h1>

    <div class="tabs flex space-x-4 border-b mb-4">
      <button
        @click="activeTab = 'restaurantInfo'"
        :class="{
          'active-tab text-blue-500 border-blue-500': activeTab === 'restaurantInfo',
          'text-gray-500 hover:text-blue-500': activeTab !== 'restaurantInfo',
        }"
        class="px-4 py-2 border-b-2 font-medium"
      >
        {{ UI_TEXTS.settings.restaurantInfoTab }}
      </button>
      <button
        @click="activeTab = 'settings'"
        :class="{
          'active-tab text-blue-500 border-blue-500': activeTab === 'settings',
          'text-gray-500 hover:text-blue-500': activeTab !== 'settings',
        }"
        class="px-4 py-2 border-b-2 font-medium"
      >
        {{ UI_TEXTS.settings.settingsTab }}
      </button>
    </div>

    <div v-if="activeTab === 'restaurantInfo'">
      <!-- Restaurant Info Section -->
      <div class="border rounded shadow p-4 mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ UI_TEXTS.settings.restaurantInfo.title }}</h2>
          <button @click="toggleEdit('info')" class="text-blue-500 hover:text-blue-700">
            <i class="fas fa-edit"></i> {{ UI_TEXTS.settings.restaurantInfo.editButton }}
          </button>
        </div>
        <div v-show="!editMode.info">
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantInfo.nameLabel }}:</strong>
            {{ restaurantSettingsRef.name }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantInfo.addressLabel }}:</strong>
            {{ restaurantSettingsRef.address.line1 }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantInfo.phoneLabel }}:</strong>
            {{ restaurantSettingsRef.phone }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantInfo.emailLabel }}:</strong>
            {{ restaurantSettingsRef.email }}
          </p>
        </div>
        <form v-show="editMode.info" @submit.prevent="confirmSaveRestaurantInfo">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.settings.restaurantInfo.nameLabel
            }}</label>
            <input
              v-model="restaurantSettingsRef.name"
              type="text"
              id="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>
          <div class="mb-4">
            <label for="address" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.settings.restaurantInfo.addressLabel
            }}</label>
            <textarea
              v-model="restaurantSettingsRef.address.line1"
              id="address"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="phone" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.settings.restaurantInfo.phoneLabel
            }}</label>
            <input
              v-model="restaurantSettingsRef.phone"
              type="text"
              id="phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">{{
              UI_TEXTS.settings.restaurantInfo.emailLabel
            }}</label>
            <input
              v-model="restaurantSettingsRef.email"
              type="email"
              id="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
            {{ UI_TEXTS.settings.restaurantInfo.saveButton }}
          </button>
        </form>
      </div>

      <!-- Restaurant Settings Section -->
      <div class="border rounded shadow p-4 mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ UI_TEXTS.settings.restaurantSettings.title }}</h2>
          <button @click="toggleEdit('settings')" class="text-blue-500 hover:text-blue-700">
            <i class="fas fa-edit"></i> {{ UI_TEXTS.settings.restaurantSettings.editButton }}
          </button>
        </div>
        <div v-show="!editMode.settings">
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.openingTimeLabel }}:</strong>
            {{ restaurantSettingsRef.hours.open }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.closingTimeLabel }}:</strong>
            {{ restaurantSettingsRef.hours.close }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.deliveryHoursLabel }}:</strong>
            {{ restaurantSettingsRef.delivery_hours?.start || '--:--' }} -
            {{ restaurantSettingsRef.delivery_hours?.end || '--:--' }}
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.minAdvanceTimeLabel }}:</strong>
            {{ restaurantSettingsRef.hours.minAdvanceTime }} hours
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.maxAdvanceDaysLabel }}:</strong>
            {{ restaurantSettingsRef.hours.maxAdvanceDays }} days
          </p>
          <p>
            <strong>{{ UI_TEXTS.settings.restaurantSettings.businessDaysLabel }}:</strong>
            {{ restaurantSettingsRef.hours.businessDays.join(', ') }}
          </p>
          <div
            v-if="
              restaurantSettingsRef.hours.specialDays &&
              restaurantSettingsRef.hours.specialDays.length > 0
            "
          >
            <strong>{{ UI_TEXTS.settings.restaurantSettings.specialDaysLabel }}:</strong>
            <ul class="list-disc list-inside ml-2">
              <li
                v-for="d in restaurantSettingsRef.hours.specialDays"
                :key="d"
                class="text-blue-600"
              >
                {{ d }}
              </li>
            </ul>
          </div>
          <div
            v-if="
              restaurantSettingsRef.hours.holidays &&
              restaurantSettingsRef.hours.holidays.length > 0
            "
          >
            <strong>{{ UI_TEXTS.settings.restaurantSettings.holidaysLabel }}:</strong>
            <ul class="list-disc list-inside ml-2">
              <li v-for="h in restaurantSettingsRef.hours.holidays" :key="h" class="text-red-600">
                {{ h }}
              </li>
            </ul>
          </div>
        </div>
        <form v-show="editMode.settings" @submit.prevent="confirmSaveRestaurantSettings">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="hoursOpen" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.openingTimeLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.hours.open"
                type="time"
                id="hoursOpen"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label for="hoursClose" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.closingTimeLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.hours.close"
                type="time"
                id="hoursClose"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label for="deliveryStart" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.deliveryStartLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.delivery_hours.start"
                type="time"
                id="deliveryStart"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label for="deliveryEnd" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.deliveryEndLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.delivery_hours.end"
                type="time"
                id="deliveryEnd"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label for="minAdvanceTime" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.minAdvanceTimeLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.hours.minAdvanceTime"
                type="number"
                id="minAdvanceTime"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label for="maxAdvanceDays" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.maxAdvanceDaysLabel
              }}</label>
              <input
                v-model="restaurantSettingsRef.hours.maxAdvanceDays"
                type="number"
                id="maxAdvanceDays"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label for="businessDays" class="block text-sm font-medium text-gray-700">{{
                UI_TEXTS.settings.restaurantSettings.businessDaysLabel
              }}</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="day in [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ]"
                  :key="day"
                  class="flex items-center"
                >
                  <input
                    type="checkbox"
                    v-model="restaurantSettingsRef.hours.businessDays"
                    :value="day"
                    class="mr-2"
                  />
                  {{ day }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{
                UI_TEXTS.settings.restaurantSettings.specialDaysLabel
              }}</label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newSpecialDay"
                  type="date"
                  class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
                <button
                  @click.prevent="addSpecialDay"
                  class="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  {{ UI_TEXTS.settings.restaurantSettings.addSpecialDayButton }}
                </button>
              </div>
              <ul class="space-y-1 mb-4">
                <li
                  v-for="(date, index) in restaurantSettingsRef.hours.specialDays"
                  :key="index"
                  class="flex items-center justify-between bg-blue-50 p-2 rounded"
                >
                  <span>{{ date }}</span>
                  <button
                    @click.prevent="removeSpecialDay(index)"
                    class="text-red-500 hover:text-red-700 text-sm"
                  >
                    {{ UI_TEXTS.settings.restaurantSettings.removeSpecialDayButton }}
                  </button>
                </li>
                <li
                  v-if="!restaurantSettingsRef.hours.specialDays?.length"
                  class="text-gray-500 text-sm italic"
                >
                  No special open days set.
                </li>
              </ul>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{
                UI_TEXTS.settings.restaurantSettings.holidaysLabel
              }}</label>
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newHoliday"
                  type="date"
                  class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
                <button
                  @click.prevent="addHoliday"
                  class="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                  {{ UI_TEXTS.settings.restaurantSettings.addHolidayButton }}
                </button>
              </div>
              <ul class="space-y-1">
                <li
                  v-for="(date, index) in restaurantSettingsRef.hours.holidays"
                  :key="index"
                  class="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span>{{ date }}</span>
                  <button
                    @click.prevent="removeHoliday(index)"
                    class="text-red-500 hover:text-red-700 text-sm"
                  >
                    {{ UI_TEXTS.settings.restaurantSettings.removeHolidayButton }}
                  </button>
                </li>
                <li
                  v-if="!restaurantSettingsRef.hours.holidays?.length"
                  class="text-gray-500 text-sm italic"
                >
                  No special holidays set.
                </li>
              </ul>
            </div>
          </div>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
            {{ UI_TEXTS.settings.restaurantSettings.saveButton }}
          </button>
        </form>
      </div>
    </div>

    <div v-if="activeTab === 'settings'">
      <!-- Banner Settings -->
      <div class="border border-blue-500 p-4 rounded mb-4">
        <h2 class="text-xl font-semibold mb-4 text-blue-800">アナウンスバナー管理</h2>

        <!-- Create New Banner -->
        <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <h3 class="text-md font-bold mb-3 text-blue-700">新規バナー作成</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">バナーテキスト</label>
              <input
                v-model="newBannerRef.title"
                type="text"
                placeholder="例: 7月限定！からあげ弁当100円引き"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">リンクURL (任意)</label>
              <input
                v-model="newBannerRef.link"
                type="url"
                placeholder="https://..."
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          <button
            @click="addNewBanner"
            class="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            新規バナーを公開
          </button>
        </div>

        <!-- Banner History / List -->
        <div>
          <h3 class="text-md font-bold mb-3 text-gray-700">バナー履歴</h3>
          <div
            v-if="!bannersListRef.length"
            class="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg"
          >
            履歴はありません
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(banner, index) in bannersListRef"
              :key="banner.id"
              class="flex items-center justify-between p-4 rounded-lg border bg-white shadow-sm hover:border-blue-200 transition-colors"
              :class="{ 'border-l-4 border-l-green-500': banner.active }"
            >
              <div class="flex-1 min-w-0 mr-4">
                <div class="flex items-center mb-1">
                  <span
                    :class="[
                      banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                    ]"
                    class="text-xs px-2 py-0.5 rounded-full font-bold mr-2 uppercase tracking-wider"
                  >
                    {{ banner.active ? '表示中' : '非表示' }}
                  </span>
                  <p class="font-bold text-gray-800 truncate">{{ banner.title }}</p>
                </div>
                <p v-if="banner.link" class="text-xs text-blue-500 truncate italic">
                  {{ banner.link }}
                </p>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <button
                  @click="toggleBannerStatus(index)"
                  :class="[
                    banner.active
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200',
                  ]"
                  class="p-2 rounded-md transition-colors"
                  :title="banner.active ? '非表示にする' : '表示する'"
                >
                  <i class="fas" :class="banner.active ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
                <button
                  @click="deleteBanner(index)"
                  class="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  title="削除"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Sound Test -->
      <div class="border border-yellow-400 p-4 rounded mb-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-yellow-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-yellow-800">通知音テスト</h2>
        </div>
        <p class="text-sm text-gray-500 mb-3">
          ボタンを押して注文通知音を確認できます。ブラウザが音声を許可している場合のみ再生されます。
        </p>
        <div class="flex items-center gap-3">
          <button
            @click="testNotificationSound"
            :disabled="isSoundTesting"
            :class="
              isSoundTesting
                ? 'bg-yellow-300 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            "
            class="flex items-center gap-2 px-4 py-2 text-white rounded-md font-medium transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="['h-4 w-4', isSoundTesting ? 'animate-bounce' : '']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3"
              />
            </svg>
            {{ isSoundTesting ? '✅ テスト通知を送信しました' : '🔔 新規注文をシミュレート' }}
          </button>
          <span
            v-if="soundTestResult"
            :class="soundTestResult === 'ok' ? 'text-green-600' : 'text-red-500'"
            class="text-sm font-medium"
          >
            {{ soundTestResult === 'ok' ? '👆 右上の通知を確認してください' : '' }}
          </span>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="border border-green-500 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">{{ UI_TEXTS.settings.title }}</h2>
        <div class="mb-4">
          <label for="orderingEnabled" class="block text-sm font-medium text-gray-700">{{
            UI_TEXTS.settings.orderingEnabled.label
          }}</label>
          <button
            @click="confirmOrderingEnabledChange"
            :class="sensitiveSettingsRef.orderingEnabled ? 'bg-green-500' : 'bg-red-500'"
            class="px-4 py-2 text-white rounded"
          >
            {{
              sensitiveSettingsRef.orderingEnabled
                ? UI_TEXTS.settings.orderingEnabled.disableButton
                : UI_TEXTS.settings.orderingEnabled.enableButton
            }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :isOpen="showConfirmDialog"
      :title="UI_TEXTS.settings.confirmDialogs.saveRestaurantInfo.title"
      :message="UI_TEXTS.settings.confirmDialogs.saveRestaurantInfo.message"
      @confirm="saveRestaurantInfo"
      @cancel="handleCancel"
    />

    <ConfirmDialog
      :isOpen="showSettingsConfirmDialog"
      :title="UI_TEXTS.settings.confirmDialogs.saveRestaurantSettings.title"
      :message="UI_TEXTS.settings.confirmDialogs.saveRestaurantSettings.message"
      @confirm="saveRestaurantSettings"
      @cancel="handleCancel"
    />

    <ConfirmDialog
      :isOpen="showOrderingConfirmDialog"
      :title="UI_TEXTS.settings.confirmDialogs.changeOrderingStatus.title"
      :message="
        sensitiveSettingsRef.orderingEnabled
          ? UI_TEXTS.settings.confirmDialogs.changeOrderingStatus.disableMessage
          : UI_TEXTS.settings.confirmDialogs.changeOrderingStatus.enableMessage
      "
      @confirm="handleOrderingConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { UI_TEXTS } from '../constants/ui-texts';
import { settingsApi } from '../api/settings';

export default {
  components: {
    ConfirmDialog,
  },
  setup() {
    const activeTab = ref('restaurantInfo');

    // Sound test
    const isSoundTesting = ref(false);
    const soundTestResult = ref(null);
    const testNotificationSound = async () => {
      isSoundTesting.value = true;
      soundTestResult.value = null;
      window.dispatchEvent(new CustomEvent('test-order-notification'));
      soundTestResult.value = 'ok';
      setTimeout(() => {
        isSoundTesting.value = false;
        soundTestResult.value = null;
      }, 4000);
    };
    const restaurantSettingsRef = ref({
      name: '',
      address: { line1: '' },
      phone: '',
      email: '',
      hours: {
        open: '',
        close: '',
        minAdvanceTime: 0,
        maxAdvanceDays: 0,
        businessDays: [],
        holidays: [],
        specialDays: [],
      },
      delivery_hours: {
        start: '',
        end: '',
      },
      support: {},
    });
    const bannersListRef = ref([]);
    const newBannerRef = ref({ title: '', link: '' });
    const newHoliday = ref('');
    const sensitiveSettingsRef = ref({ orderingEnabled: true });
    const showConfirmDialog = ref(false);
    const showSettingsConfirmDialog = ref(false);
    const showOrderingConfirmDialog = ref(false);
    const editMode = ref({ info: false, settings: false });

    onMounted(async () => {
      const info = await settingsApi.getRestaurantInfo();
      if (info) {
        restaurantSettingsRef.value = {
          name: info.restaurant_name || '',
          address: info.restaurant_address || { line1: '' },
          phone: info.restaurant_phone || '',
          email: info.restaurant_email || '',
          hours: {
            open: '',
            close: '',
            minAdvanceTime: 0,
            maxAdvanceDays: 0,
            businessDays: [],
            holidays: [],
            specialDays: [],
            ...(info.business_hours || {}),
          },
          delivery_hours: info.delivery_hours || { start: '', end: '' },
          support: info.support_info || {},
        };
      }
      if (info?.banners) {
        const rawBanners = Array.isArray(info.banners) ? info.banners : [info.banners];
        bannersListRef.value = rawBanners.map((b) => ({
          ...b,
          active: b.active !== undefined ? b.active : true,
        }));
      }
    });

    const toggleEdit = (section) => {
      editMode.value[section] = !editMode.value[section];
    };

    const confirmSaveRestaurantInfo = () => {
      showConfirmDialog.value = true;
    };

    const confirmSaveRestaurantSettings = () => {
      showSettingsConfirmDialog.value = true;
    };

    const confirmOrderingEnabledChange = () => {
      showOrderingConfirmDialog.value = true;
    };

    const handleOrderingConfirm = async () => {
      try {
        const newValue = !sensitiveSettingsRef.value.orderingEnabled;
        const success = await settingsApi.updateSettings('ordering_enabled', newValue);
        if (success) {
          sensitiveSettingsRef.value.orderingEnabled = newValue;
        }
      } catch (error) {
        console.error('Failed to change ordering status:', error);
      } finally {
        showOrderingConfirmDialog.value = false;
      }
    };

    const handleCancel = () => {
      showConfirmDialog.value = false;
      showSettingsConfirmDialog.value = false;
      showOrderingConfirmDialog.value = false;
    };

    const saveRestaurantInfo = async () => {
      try {
        const info = restaurantSettingsRef.value;
        // The API expects individual updates or a bulk update?
        // handleUpdateSettings takes key, value.
        // Let's preserve the structure.
        const success = await settingsApi.updateSettings('restaurant_name', info.name);
        if (success) {
          await settingsApi.updateSettings('restaurant_address', info.address);
          await settingsApi.updateSettings('restaurant_phone', info.phone);
          await settingsApi.updateSettings('restaurant_email', info.email);
          editMode.value.info = false;
        }
      } catch (error) {
        console.error('Failed to save restaurant info:', error);
      } finally {
        showConfirmDialog.value = false;
      }
    };

    const saveRestaurantSettings = async () => {
      try {
        const info = restaurantSettingsRef.value;
        const success = await settingsApi.updateSettings('business_hours', info.hours);
        if (success) {
          await settingsApi.updateSettings('delivery_hours', info.delivery_hours);
          editMode.value.settings = false;
        }
      } catch (error) {
        console.error('Failed to save restaurant settings:', error);
      } finally {
        showSettingsConfirmDialog.value = false;
      }
    };

    const addNewBanner = async () => {
      if (!newBannerRef.value.title) {
        alert('バナーテキストを入力してください');
        return;
      }

      const newBanner = {
        id: `banner-${Date.now()}`,
        title: newBannerRef.value.title,
        link: newBannerRef.value.link,
        active: true,
        created_at: new Date().toISOString(),
      };

      // Add to list (at the end so it's most recent)
      const newList = [...bannersListRef.value, newBanner];

      try {
        const success = await settingsApi.updateSettings('banners', newList);
        if (success) {
          bannersListRef.value = newList;
          newBannerRef.value = { title: '', link: '' };
          alert('新しいバナーを公開しました');
        } else {
          alert('保存に失敗しました');
        }
      } catch (e) {
        console.error(e);
        alert('エラーが発生しました');
      }
    };

    const toggleBannerStatus = async (index) => {
      const newList = JSON.parse(JSON.stringify(bannersListRef.value));
      newList[index].active = !newList[index].active;

      try {
        const success = await settingsApi.updateSettings('banners', newList);
        if (success) {
          bannersListRef.value = newList;
        }
      } catch (e) {
        console.error(e);
        alert('状態の更新に失敗しました');
      }
    };

    const deleteBanner = async (index) => {
      if (!confirm('このバナーを削除しますか？')) return;

      const newList = bannersListRef.value.filter((_, i) => i !== index);

      try {
        const success = await settingsApi.updateSettings('banners', newList);
        if (success) {
          bannersListRef.value = newList;
          alert('バナーを削除しました');
        }
      } catch (e) {
        console.error(e);
        alert('削除に失敗しました');
      }
    };

    const addHoliday = () => {
      if (
        newHoliday.value &&
        !restaurantSettingsRef.value.hours.holidays.includes(newHoliday.value)
      ) {
        if (!restaurantSettingsRef.value.hours.holidays)
          restaurantSettingsRef.value.hours.holidays = [];
        restaurantSettingsRef.value.hours.holidays.push(newHoliday.value);
        restaurantSettingsRef.value.hours.holidays.sort();
        newHoliday.value = '';
      }
    };

    const removeHoliday = (index) => {
      restaurantSettingsRef.value.hours.holidays.splice(index, 1);
    };

    const newSpecialDay = ref('');
    const addSpecialDay = () => {
      if (
        newSpecialDay.value &&
        !restaurantSettingsRef.value.hours.specialDays?.includes(newSpecialDay.value)
      ) {
        if (!restaurantSettingsRef.value.hours.specialDays)
          restaurantSettingsRef.value.hours.specialDays = [];
        restaurantSettingsRef.value.hours.specialDays.push(newSpecialDay.value);
        restaurantSettingsRef.value.hours.specialDays.sort();
        newSpecialDay.value = '';
      }
    };

    const removeSpecialDay = (index) => {
      restaurantSettingsRef.value.hours.specialDays.splice(index, 1);
    };

    return {
      activeTab,
      isSoundTesting,
      soundTestResult,
      testNotificationSound,
      restaurantSettingsRef,
      sensitiveSettingsRef,
      showConfirmDialog,
      showSettingsConfirmDialog,
      showOrderingConfirmDialog,
      editMode,
      toggleEdit,
      confirmSaveRestaurantInfo,
      confirmSaveRestaurantSettings,
      confirmOrderingEnabledChange,
      handleCancel,
      saveRestaurantInfo,
      saveRestaurantSettings,
      handleOrderingConfirm,
      addHoliday,
      removeHoliday,
      newHoliday,
      addSpecialDay,
      removeSpecialDay,
      newSpecialDay,
      bannersListRef,
      newBannerRef,
      addNewBanner,
      toggleBannerStatus,
      deleteBanner,
      UI_TEXTS,
    };
  },
};
</script>
