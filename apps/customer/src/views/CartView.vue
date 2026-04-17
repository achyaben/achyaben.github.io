<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <header class="sticky top-0 bg-white shadow z-50">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-600 hover:text-gray-900">
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
          </router-link>
          <h1 class="text-xl font-bold ml-4">メニューに戻る</h1>
        </div>

        <!-- Help Button -->
        <button
          @click="showHelp = true"
          class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-gray-500">店舗情報を読み込み中...</p>
      </div>

      <div v-else-if="!cartItems.length" class="text-center py-12">
        <p class="text-gray-600 mb-4">注文が空です</p>
        <router-link
          to="/"
          class="inline-block bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          メニューに戻る
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Order Summary Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b">
            <h2 class="text-lg font-bold">注文内容</h2>
          </div>
          <div class="divide-y">
            <CartItem
              v-for="item in cartItems"
              :key="item.item.id + JSON.stringify(item.customizations)"
              :cartItem="item"
            />
          </div>
          <div class="p-4 border-t bg-gray-50">
            <div class="flex justify-between items-center text-xl font-bold">
              <span>合計金額</span>
              <span class="text-primary">¥{{ cartTotal }}</span>
            </div>
          </div>
        </div>

        <!-- Order Selection Flow -->
        <form @submit.prevent="submitOrder" class="space-y-6">
          <!-- Order Type Selection Card -->
          <div
            class="bg-white rounded-lg shadow-sm border-t-4"
            :class="orderForm.order_type === 'pickup' ? 'border-blue-500' : 'border-green-500'"
          >
            <div class="p-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-bold">受け取り方法</h2>
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="
                  orderForm.order_type === 'pickup'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                "
              >
                {{ orderForm.order_type === 'pickup' ? '店頭受取' : '配達' }}
              </span>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="
                    orderForm.order_type = 'pickup';
                    onOrderTypeChange();
                  "
                  class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2"
                  :class="
                    orderForm.order_type === 'pickup'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-500/20'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'
                  "
                >
                  <div
                    class="p-2 rounded-full"
                    :class="
                      orderForm.order_type === 'pickup'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    "
                  >
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span class="font-bold text-sm">店頭受取</span>
                  <span
                    class="text-[10px] opacity-70 border-t border-blue-200 mt-1 pt-1 w-full text-center"
                  >
                    {{ earliestPickupInfo }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="
                    orderForm.order_type = 'delivery';
                    onOrderTypeChange();
                  "
                  class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 gap-2"
                  :class="
                    orderForm.order_type === 'delivery'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-500/20'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-green-200'
                  "
                >
                  <div
                    class="p-2 rounded-full"
                    :class="
                      orderForm.order_type === 'delivery'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    "
                  >
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
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zM13 16l5 2V7l-5 2m0 7h5"
                      />
                    </svg>
                  </div>
                  <span class="font-bold text-sm">お届け</span>
                  <span
                    class="text-[10px] opacity-70 border-t border-green-200 mt-1 pt-1 w-full text-center"
                  >
                    {{ earliestDeliveryInfo }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Customer Information Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">お客様情報 (お届け先)</h2>
              <button
                v-if="isProfileComplete && !isEditingProfile"
                type="button"
                @click="isEditingProfile = true"
                class="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                変更する
              </button>
            </div>

            <div class="p-4 space-y-4">
              <!-- Profile Summary View -->
              <div
                v-if="isProfileComplete && !isEditingProfile"
                class="bg-gray-50 rounded-xl p-4 border border-gray-100 divide-y divide-gray-200"
              >
                <div class="pb-3 flex justify-between">
                  <span class="text-xs text-gray-400 font-bold uppercase">お名前</span>
                  <span class="font-bold"
                    >{{ orderForm.lastName }} {{ orderForm.firstName }} 様</span
                  >
                </div>
                <div class="py-3 flex justify-between">
                  <span class="text-xs text-gray-400 font-bold uppercase">電話番号</span>
                  <span class="font-bold">{{ orderForm.companyContact }}</span>
                </div>
                <div class="pt-3">
                  <span class="text-xs text-gray-400 font-bold uppercase block mb-1">お届け先</span>
                  <p class="text-sm font-bold leading-relaxed">
                    〒{{ orderForm.postalCode }}<br />
                    {{ orderForm.addressLine }}
                  </p>
                </div>
              </div>

              <!-- Full Form View -->
              <div v-else class="space-y-4">
                <!-- Name Fields -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >姓<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="orderForm.lastName"
                      type="text"
                      required
                      placeholder="山田"
                      :class="[
                        'w-full rounded-lg focus:ring-primary transition-colors',
                        validationErrors.lastName
                          ? 'border-red-300 focus:border-red-500 bg-red-50'
                          : 'border-gray-300 focus:border-primary',
                      ]"
                      @input="saveCustomerInfo"
                    />
                    <p v-if="validationErrors.lastName" class="mt-1 text-sm text-red-500">
                      {{ validationErrors.lastName }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >名<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="orderForm.firstName"
                      type="text"
                      required
                      placeholder="太郎"
                      class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      @input="saveCustomerInfo"
                    />
                    <p v-if="validationErrors.firstName" class="mt-1 text-sm text-red-500">
                      {{ validationErrors.firstName }}
                    </p>
                  </div>
                </div>

                <!-- Address Fields -->
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >郵便番号<span class="text-red-500">*</span></label
                    >
                    <input
                      v-model="orderForm.postalCode"
                      type="text"
                      required
                      placeholder="100-0005"
                      pattern="^\d{3}-?\d{4}$"
                      class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      @input="saveCustomerInfo"
                    />
                    <p v-if="validationErrors.postalCode" class="mt-1 text-sm text-red-500">
                      {{ validationErrors.postalCode }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >お届け先住所
                      <span class="text-xs font-normal text-gray-500">(お勤め先・配達先)</span
                      ><span class="text-red-500">*</span></label
                    >
                    <textarea
                      v-model="orderForm.addressLine"
                      required
                      rows="3"
                      placeholder="江戸川区南葛西5-13-10 ヤキベンビル 3F 会議室"
                      class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                      @input="saveCustomerInfo"
                    ></textarea>
                    <p v-if="validationErrors.addressLine" class="mt-1 text-sm text-red-500">
                      {{ validationErrors.addressLine }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >電話番号<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="orderForm.companyContact"
                    type="tel"
                    required
                    pattern="^[0-9]{10,11}$"
                    title="10桁または11桁の電話番号を入力してください"
                    placeholder="個人の携帯または会社の番号 (ハイフンなし)"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    @input="saveCustomerInfo"
                  />
                  <p v-if="validationErrors.companyContact" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.companyContact }}
                  </p>
                </div>

                <div v-if="isEditingProfile" class="pt-2 flex justify-end">
                  <button
                    type="button"
                    @click="isEditingProfile = false"
                    class="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm transition-all"
                  >
                    入力を完了する
                  </button>
                </div>
              </div>

              <!-- Fulfillment Section (Always Visible) -->
              <div class="pt-4 border-t border-gray-100 space-y-4">
                <h3 class="font-bold text-gray-700 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  受け取り希望日時
                </h3>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >受け取り日<span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="orderForm.deliveryDate"
                    type="date"
                    required
                    :min="minDate"
                    :max="maxDate"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    @change="onDateChange"
                  />
                  <p v-if="validationErrors.deliveryDate" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.deliveryDate }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >受け取り時間<span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="orderForm.deliveryTimeSlot"
                    required
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                    :disabled="!orderForm.deliveryDate || !availableTimeSlots.length"
                  >
                    <option value="" disabled>時間を選択してください</option>
                    <option v-for="time in availableTimeSlots" :key="time" :value="time">
                      {{ time }}
                    </option>
                  </select>
                  <p v-if="validationErrors.deliveryTimeSlot" class="mt-1 text-sm text-red-500">
                    {{ validationErrors.deliveryTimeSlot }}
                  </p>
                  <p
                    v-if="orderForm.deliveryDate && !availableTimeSlots.length"
                    class="mt-1 text-sm text-red-500"
                  >
                    選択された日は予約可能な時間がありません
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                  <textarea
                    v-model="orderForm.notes"
                    rows="2"
                    placeholder="アレルギーなどの注意事項があればご記入ください"
                    class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b">
              <h2 class="text-lg font-bold">お支払い方法</h2>
            </div>
            <div class="p-4 space-y-3">
              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-primary bg-primary/5': orderForm.paymentMethod === 'cash' }"
              >
                <input
                  type="radio"
                  v-model="orderForm.paymentMethod"
                  value="cash"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span class="ml-3">現金</span>
              </label>

              <label
                class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-primary bg-primary/5': orderForm.paymentMethod === 'paypay' }"
              >
                <input
                  type="radio"
                  v-model="orderForm.paymentMethod"
                  value="paypay"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <div class="ml-3">
                  <span class="font-bold text-[#0095EE]">PayPay</span>
                  <span class="text-sm text-gray-500 ml-2">(受け取り時に決済)</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="space-y-3">
            <div v-if="!isAuthenticated" class="text-center p-4 bg-gray-100 rounded-xl mb-4">
              <p class="text-gray-600 mb-3">注文するにはログインが必要です</p>
            </div>

            <!-- Authenticated State -->
            <div
              v-if="isAuthenticated && !isMinPriceMet"
              class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3 flex items-start gap-3 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <p class="text-sm font-bold text-amber-800">最低注文金額に達していません</p>
                <p class="text-xs text-amber-700">
                  合計で ¥{{ MIN_ORDER_PRICE }} 以上の注文が必要です（現在: ¥{{ cartTotal }}）
                </p>
              </div>
            </div>

            <button
              v-else-if="isAuthenticated"
              type="submit"
              :disabled="!isFormValid || isSubmitting || !isMinPriceMet"
              class="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all duration-300 transform hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center font-black text-lg"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin mr-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ isSubmitting ? '処理中...' : `注文を確定する (¥${cartTotal})` }}
            </button>

            <!-- Validation Summary -->
            <div v-if="hasValidationErrors" class="bg-red-50 border border-red-100 rounded-lg p-4">
              <h3 class="font-medium text-red-800 mb-2">以下の項目を確認してください：</h3>
              <ul class="text-sm text-red-600 space-y-1 list-disc list-inside">
                <li v-if="validationErrors.firstName || validationErrors.lastName">
                  お名前を正しく入力してください（漢字、ひらがな、カタカナ、アルファベットのみ）
                </li>
                <li v-if="validationErrors.postalCode">
                  郵便番号は半角数字7桁で入力してください（例：100-0005）
                </li>
                <li
                  v-if="
                    validationErrors.prefecture ||
                    validationErrors.city ||
                    validationErrors.addressLine
                  "
                >
                  住所を正しく入力してください（都道府県、市区町村、番地・建物名）
                </li>
                <li v-if="validationErrors.companyContact">
                  電話番号は半角数字10桁または11桁で入力してください（例：0312345678）
                </li>
                <li v-if="validationErrors.deliveryDate">
                  {{ validationErrors.deliveryDate }}
                </li>
                <li v-if="validationErrors.deliveryTimeSlot">
                  {{ validationErrors.deliveryTimeSlot }}
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </main>

    <!-- Help Modal -->
    <div
      v-if="showHelp"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showHelp = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold">お問い合わせ</h3>
          <button @click="showHelp = false" class="text-gray-500 hover:text-gray-700">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div v-if="restaurantInfo" class="space-y-4">
          <div>
            <h4 class="font-medium mb-2">ご注文について</h4>
            <ul class="space-y-2 text-sm">
              <li>ご注文は{{ restaurantInfo.hours.minAdvanceTime }}分前までにお願いいたします</li>
              <li>
                受け取り時間は{{ restaurantInfo.hours.open }}:00〜{{
                  restaurantInfo.hours.orderDeadline
                }}:00の間でご指定ください
              </li>
              <li>{{ restaurantInfo.hours.maxAdvanceDays }}営業日先までご予約可能です</li>
              <li>営業日: {{ businessDaysText }}</li>
              <li v-if="holidaysText">臨時休業: {{ holidaysText }}</li>
            </ul>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p>
              電話番号：<a :href="`tel:${restaurantInfo.phone}`" class="text-primary">{{
                restaurantInfo.phone
              }}</a>
            </p>
            <p>営業時間：{{ restaurantInfo.hours.open }}:00〜{{ restaurantInfo.hours.close }}:00</p>
            <p v-if="restaurantInfo.delivery_hours">
              配達時間：{{ restaurantInfo.delivery_hours.start }}〜{{
                restaurantInfo.delivery_hours.end
              }}
            </p>
            <p>
              LINE：<a
                :href="`https://line.me/R/ti/p/${restaurantInfo.sns.line}`"
                target="_blank"
                class="text-primary"
                >{{ restaurantInfo.sns.line }}
              </a>
            </p>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-400">読み込み中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import CartItem from '../components/CartItem.vue';
import { generateTrackingId } from '../data/menu';
import { STORAGE_KEYS } from '../constants';
import { ordersApi } from '../data/api/orders';
import { useCart } from '../stores/cart';
import { useRestaurantStore } from '../stores/restaurant';
import { toJSTDateString, toJSTTimeString } from '../utils/date';
import { supabase } from '@app/supabase';
import type { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../types';

const router = useRouter();
const { cartItems, cartTotal, clearCart } = useCart();
const { info: restaurantInfo, fetchInfo, isLoading } = useRestaurantStore();
const showHelp = ref(false);
const isSubmitting = ref(false); // Add loading state
const isEditingProfile = ref(false);

const isProfileComplete = computed(() => {
  return !!(
    orderForm.value.lastName &&
    orderForm.value.firstName &&
    orderForm.value.postalCode &&
    orderForm.value.addressLine &&
    orderForm.value.companyContact
  );
});

const MIN_ORDER_PRICE = 650;
const isMinPriceMet = computed(() => cartTotal.value >= MIN_ORDER_PRICE);

onMounted(async () => {
  await fetchInfo(); // Ensure we have the latest settings
  await checkAuth();
});

const isAuthenticated = ref(false);

async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  isAuthenticated.value = !!session;

  // Also listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session;
    if (session) {
      // Re-fetch profile if user just logged in
      // We can extract the profile loading logic to a function and call it here
      loadProfileData();
    }
  });
}

async function loadProfileData() {
  // 1. Try to fetch from Supabase (Source of Truth for Profile)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        orderForm.value.firstName = profile.f_name || '';
        orderForm.value.lastName = profile.l_name || '';
        orderForm.value.companyContact = profile.tel || '';
        orderForm.value.postalCode = profile.postcode || '';
        orderForm.value.addressLine = profile.address || ''; // Direct map, no parsing needed
      }
    }
  } catch (e) {
    console.warn('Failed to load profile from Supabase, falling back to local:', e);
  }
}

// ... (interface remains same)

interface ValidationErrors {
  firstName: string;
  lastName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  companyContact: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
}

const orderForm = ref({
  firstName: '',
  lastName: '',
  postalCode: '',
  // prefecture: '', // Removed
  // city: '', // Removed
  addressLine: '', // Now serves as the full address excluding postal code
  companyContact: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
  order_type: 'delivery' as 'pickup' | 'delivery',
  notes: '',
  paymentMethod: 'cash' as PaymentMethod,
  needReceipt: false,
});

const validationErrors = ref<ValidationErrors>({
  firstName: '',
  lastName: '',
  postalCode: '',
  prefecture: '', // Keep type for now to avoid breaking interface locally, but won't use
  city: '',
  addressLine: '',
  companyContact: '',
  deliveryDate: '',
  deliveryTimeSlot: '',
});

// Watch for form changes to trigger validation
watch(
  orderForm,
  () => {
    validateForm();
  },
  { deep: true }
);

// Load saved customer info and reorder pickup time from localStorage OR Supabase
onMounted(async () => {
  await checkAuth();
  if (isAuthenticated.value) {
    await loadProfileData();
  }

  // 2. Fallback / Override with LocalStorage
  if (!orderForm.value.firstName) {
    const savedInfo = localStorage.getItem(STORAGE_KEYS.CUSTOMER_INFO);
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      orderForm.value.firstName = info.firstName || '';
      orderForm.value.lastName = info.lastName || '';
      orderForm.value.postalCode = info.postalCode || '';
      // orderForm.value.prefecture = info.prefecture || '';
      // orderForm.value.city = info.city || '';
      orderForm.value.addressLine = info.addressLine || '';
      orderForm.value.companyContact = info.companyContact || '';
      orderForm.value.needReceipt = info.needReceipt || false;
    }
  }

  // ... (rest of onMounted)

  // Check for preserved pickup time from reorder
  const savedDeliveryTime = localStorage.getItem(STORAGE_KEYS.REORDER_PICKUP_TIME);
  if (savedDeliveryTime) {
    const deliveryTime = new Date(savedDeliveryTime);
    // Final validation before using the preserved time
    // We can just rely on the form validation or basic date check
    const min = new Date(minDate.value);
    const max = new Date(maxDate.value);
    const dDate = new Date(deliveryTime);
    dDate.setHours(0, 0, 0, 0); // compare dates only

    if (dDate >= min && dDate <= max) {
      orderForm.value.deliveryDate = toJSTDateString(deliveryTime);
      const hours = toJSTTimeString(deliveryTime);
      orderForm.value.deliveryTimeSlot = hours;
    }
    // Remove the saved pickup time
    localStorage.removeItem(STORAGE_KEYS.REORDER_PICKUP_TIME);
  }

  validateForm();
});

// Save customer info to localStorage
function saveCustomerInfo() {
  localStorage.setItem(
    STORAGE_KEYS.CUSTOMER_INFO,
    JSON.stringify({
      firstName: orderForm.value.firstName,
      lastName: orderForm.value.lastName,
      postalCode: orderForm.value.postalCode,
      // prefecture: orderForm.value.prefecture,
      // city: orderForm.value.city,
      addressLine: orderForm.value.addressLine,
      companyContact: orderForm.value.companyContact,
      needReceipt: orderForm.value.needReceipt,
    })
  );
  validateForm();
}

// Helper to format Date to 'YYYY-MM-DDTHH:mm' in Local Time
function toLocalISOString(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const isDateValid = (d: Date) => {
  const dayOfWeek = d.getDay();
  const dateStr = d.toLocaleDateString('sv-SE'); // Consistent YYYY-MM-DD
  const hours = restaurantInfo.value?.hours;
  if (!hours) return false;

  // 1. Holiday check (Highest priority - Closed)
  if (hours.holidays && hours.holidays.includes(dateStr)) return false;

  // 2. Special Open Day check (Override business days)
  if (hours.specialDays && hours.specialDays.includes(dateStr)) return true;

  // 3. Normal Business Day check
  if (!hours.businessDays.includes(dayOfWeek)) return false;

  return true;
};

const minDeliveryTime = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + (restaurantInfo.value?.hours.minAdvanceTime ?? 30));

  // If after closing time (or order deadline), set to next business day
  const closingHour = restaurantInfo.value?.hours.orderDeadline ?? 20;

  if (now.getHours() >= closingHour) {
    do {
      now.setDate(now.getDate() + 1);
    } while (!isDateValid(now));
    now.setHours(restaurantInfo.value?.hours.open ?? 10, 0, 0, 0);
  } else if (now.getHours() < (restaurantInfo.value?.hours.open ?? 10)) {
    // If before opening time, set to today's open time
    now.setHours(restaurantInfo.value?.hours.open ?? 10, 0, 0, 0);
  }

  // If current day is not a business day, find next business day
  let safetyCounter = 0;
  while (!isDateValid(now) && safetyCounter < 365) {
    now.setDate(now.getDate() + 1);
    now.setHours(restaurantInfo.value?.hours.open ?? 10, 0, 0, 0);
    safetyCounter++;
  }

  return toLocalISOString(now);
});

const maxDeliveryTime = computed(() => {
  const max = new Date();
  let daysChecked = 0;
  let validDaysFound = 0;

  while (validDaysFound < (restaurantInfo.value?.hours.maxAdvanceDays ?? 30) && daysChecked < 90) {
    if (isDateValid(max)) {
      validDaysFound++;
    }
    if (validDaysFound < (restaurantInfo.value?.hours.maxAdvanceDays ?? 30)) {
      max.setDate(max.getDate() + 1);
    }
    daysChecked++;
  }

  max.setHours(restaurantInfo.value?.hours.orderDeadline ?? 20, 0, 0, 0);
  return toLocalISOString(max);
});

// Return YYYY-MM-DD for min attribute of date input
const minDate = computed(() => {
  if (!minDeliveryTime.value) return '';
  return minDeliveryTime.value.split('T')[0];
});

// Return YYYY-MM-DD for max attribute of date input
const maxDate = computed(() => {
  if (!maxDeliveryTime.value) return '';
  return maxDeliveryTime.value.split('T')[0];
});

// Generate available time slots based on selected date
const getTimeSlots = (type: 'pickup' | 'delivery', dateStr: string) => {
  if (!dateStr || !restaurantInfo.value?.hours) return [];

  const slots: string[] = [];
  const [y, m, d] = dateStr.split('-').map(Number);
  const selectedDate = new Date(y, m - 1, d);
  const now = new Date();

  const minTime = new Date();
  minTime.setMinutes(minTime.getMinutes() + (restaurantInfo.value.hours.minAdvanceTime ?? 30));

  let startHour = restaurantInfo.value.hours.open ?? 10;
  let startMinute = 0;
  let endHour = restaurantInfo.value.hours.orderDeadline ?? 20;
  let endMinute = 0;

  if (type === 'delivery' && restaurantInfo.value.delivery_hours) {
    const dHours = restaurantInfo.value.delivery_hours;
    if (dHours.start) {
      const parts = dHours.start.split(':');
      startHour = parseInt(parts[0]);
      startMinute = parseInt(parts[1] || '0');
    }
    if (dHours.end) {
      const parts = dHours.end.split(':');
      endHour = parseInt(parts[0]);
      endMinute = parseInt(parts[1] || '0');
    }
  } else {
    startHour = restaurantInfo.value.hours.open ?? 10;
    endHour = restaurantInfo.value.hours.orderDeadline ?? 20;
  }

  let current = new Date(selectedDate);
  current.setHours(startHour, startMinute, 0, 0);

  const end = new Date(selectedDate);
  end.setHours(endHour, endMinute, 0, 0);

  while (current <= end) {
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();

    if (isToday) {
      if (current >= minTime) {
        slots.push(toLocalISOString(current).slice(11, 16));
      }
    } else {
      slots.push(toLocalISOString(current).slice(11, 16));
    }
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
};

const availableTimeSlots = computed(() => {
  return getTimeSlots(orderForm.value.order_type, orderForm.value.deliveryDate);
});

const earliestPickupInfo = computed(() => {
  const date = orderForm.value.deliveryDate || minDate.value;
  const slots = getTimeSlots('pickup', date);
  if (slots.length === 0) return '本日不可';
  return `${slots[0]} 〜 ${slots[slots.length - 1]}`;
});

const earliestDeliveryInfo = computed(() => {
  const date = orderForm.value.deliveryDate || minDate.value;
  const slots = getTimeSlots('delivery', date);
  if (slots.length === 0) return '本日不可';
  return `${slots[0]} 〜 ${slots[slots.length - 1]}`;
});

// Reset time slot when date or type changes
const onDateChange = () => {
  orderForm.value.deliveryTimeSlot = '';
  validateForm();
};

const onOrderTypeChange = () => {
  orderForm.value.deliveryTimeSlot = '';
  validateForm();
};

const hasValidationErrors = computed(() => {
  return Object.values(validationErrors.value).some((error) => error !== '');
});

const isFormValid = computed(() => {
  const hasRequiredFields =
    orderForm.value.firstName &&
    orderForm.value.lastName &&
    orderForm.value.postalCode &&
    orderForm.value.addressLine && // Single field
    orderForm.value.companyContact &&
    orderForm.value.deliveryDate &&
    orderForm.value.deliveryTimeSlot &&
    orderForm.value.paymentMethod &&
    cartItems.value.length > 0;

  return hasRequiredFields && !hasValidationErrors.value;
});

const businessDaysText = computed(() => {
  if (!restaurantInfo.value?.hours.businessDays) return '';
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return restaurantInfo.value.hours.businessDays
    .slice()
    .sort((a, b) => a - b)
    .map((d) => days[d])
    .join('・');
});

const holidaysText = computed(() => {
  if (!restaurantInfo.value?.hours.holidays?.length) return '';
  return restaurantInfo.value.hours.holidays.join(', ');
});

function validateForm() {
  validationErrors.value = {
    firstName: '',
    lastName: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine: '',
    companyContact: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
  };

  // Name validation (allow Japanese or English)
  const namePattern = /^[A-Za-zぁ-んァ-ン一-龥々]+$/;
  if (!orderForm.value.firstName) {
    validationErrors.value.firstName = '名前を入力してください';
  } else if (!namePattern.test(orderForm.value.firstName)) {
    validationErrors.value.firstName = '有効な名前を入力してください';
  }

  if (!orderForm.value.lastName) {
    validationErrors.value.lastName = '姓を入力してください';
  } else if (!namePattern.test(orderForm.value.lastName)) {
    validationErrors.value.lastName = '有効な姓を入力してください';
  }

  // Postal code validation
  const postalPattern = /^\d{3}-?\d{4}$/;
  if (!orderForm.value.postalCode) {
    validationErrors.value.postalCode = '郵便番号を入力してください';
  } else if (!postalPattern.test(orderForm.value.postalCode)) {
    validationErrors.value.postalCode = '正しい郵便番号を入力してください（例：100-0005）';
  }

  // Address line validation (Single field now)
  if (!orderForm.value.addressLine) {
    validationErrors.value.addressLine = '住所を入力してください';
  }

  // Phone validation
  const phonePattern = /^[0-9]{10,11}$/;
  if (!orderForm.value.companyContact) {
    validationErrors.value.companyContact = '電話番号を入力してください';
  } else if (!phonePattern.test(orderForm.value.companyContact)) {
    validationErrors.value.companyContact = '有効な電話番号を入力してください（10桁または11桁）';
  }

  // Date/Time validation
  if (!orderForm.value.deliveryDate) {
    validationErrors.value.deliveryDate = '受け取り日を選択してください';
  } else {
    const dateStr = orderForm.value.deliveryDate;
    const hours = restaurantInfo.value?.hours;

    if (hours) {
      if (hours.holidays && hours.holidays.includes(dateStr)) {
        validationErrors.value.deliveryDate = '選択された日は臨時休業日です';
      } else if (hours.specialDays && hours.specialDays.includes(dateStr)) {
        // Special working day, skip business day check
      } else {
        // Construct date in local time to check day of week correctly
        const [y, m, d] = dateStr.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);

        if (!hours.businessDays.includes(localDate.getDay())) {
          validationErrors.value.deliveryDate = '選択された日は定休日です';
        }
      }
    }
  }

  if (orderForm.value.deliveryDate && !orderForm.value.deliveryTimeSlot) {
    validationErrors.value.deliveryTimeSlot = '受け取り時間を選択してください';
  }
}

async function submitOrder() {
  validateForm();
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const trackingId = generateTrackingId();
    // const fullAddress = ... (removed unused variable)

    // Construct the payload to match what the Edge Function expects
    const deliveryDateTime = `${orderForm.value.deliveryDate}T${orderForm.value.deliveryTimeSlot}:00`;

    const orderData: Partial<Order> = {
      trackingId,
      items: cartItems.value.map((item) => ({
        item: {
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
        },
        quantity: item.quantity,
        subtotal: item.subtotal,
        customizations: item.customizations || [],
      })) as any, // Cast to any to avoid strict MenuItem type check for payload
      customer: {
        name: `${orderForm.value.lastName} ${orderForm.value.firstName}`,
        phone: orderForm.value.companyContact,
        company: '',
        postalCode: orderForm.value.postalCode, // Send explicitly
        address: orderForm.value.addressLine, // Send as simple string without ZIP
      } as any,
      // Flat properties for the Edge Function mapper
      deliveryTime: new Date(deliveryDateTime).toISOString(),
      order_type: orderForm.value.order_type,
      notes: orderForm.value.notes,
      status: 'pending' as OrderStatus,
      paymentMethod: orderForm.value.paymentMethod,
      paymentStatus:
        orderForm.value.paymentMethod === 'paypay' ? 'pending' : ('completed' as PaymentStatus),
      total: cartTotal.value,
      // Add other fields if needed by Edge Function logic directly
    } as any;

    // Save order
    const result = await ordersApi.createOrder(orderData);

    // Clear cart
    clearCart();

    // Use the tracking ID returned by the server (in case it was re-generated or normalized)
    const finalTrackingId = result.trackingId || orderData.trackingId;

    // Save the current order ID to ensure it's available immediately
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORDER, finalTrackingId);

    // Redirect to order history page instead of detail
    await router.push({ name: 'history' });

    // Optional: Show a toast/success message before redirecting?
    // For now, history view is sufficient confirmation.
  } catch (error) {
    console.error('Order submission failed:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
