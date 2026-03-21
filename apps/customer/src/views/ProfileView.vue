<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-600 hover:text-gray-900 mr-4">
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
          <h1 class="text-xl font-bold">プロフィール設定</h1>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 max-w-lg">
      <!-- Connected Account Info -->
      <div v-if="authProvider" class="mb-6 bg-white rounded-xl shadow-sm p-4 flex items-center border-l-4" :class="authProvider === 'line' ? 'border-green-500' : 'border-blue-500'">
        <div class="mr-3">
          <img v-if="authProvider === 'line'" src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" class="w-8 h-8" />
          <img v-else-if="authProvider === 'google'" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" class="w-8 h-8" />
          <div v-else class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">連携中のアカウント</p>
          <p class="text-sm font-bold text-gray-800">
            {{ authProvider === 'line' ? 'LINE ログイン' : (authProvider === 'google' ? 'Google ログイン' : 'メールログイン') }}
          </p>
        </div>
        <div class="ml-auto">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">認証済み</span>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <!-- Status Message -->
        <div
          v-if="statusMessage"
          :class="`p-4 rounded-lg ${statusType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`"
        >
          {{ statusMessage }}
        </div>

        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Corporate/Company Name (Highlighted) -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label class="block text-sm font-bold text-blue-900 mb-1"
              >会社名 / 法人名 <span class="text-xs font-normal text-blue-600">(推奨)</span></label
            >
            <input
              v-model="form.corporateName"
              type="text"
              placeholder="株式会社 ヤキベン"
              class="w-full rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <p class="text-xs text-blue-600 mt-1">領収書の宛名として使用されます</p>
          </div>

          <!-- Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >姓 <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >名 <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >会社電話番号 <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.phone"
              type="tel"
              required
              pattern="^[0-9]{10,11}$"
              placeholder="0312345678"
              class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>

          <!-- Address Section -->
          <div class="border-t pt-4 space-y-4">
            <h3 class="font-medium text-gray-900 text-sm">
              お届け先住所 <span class="text-xs font-normal text-gray-500">(お勤め先・配達先)</span>
            </h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
              <input
                v-model="form.postalCode"
                type="text"
                placeholder="100-0001"
                class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
              <select
                v-model="form.prefecture"
                class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              >
                <option value="">選択してください</option>
                <option v-for="pref in prefectures" :key="pref" :value="pref">{{ pref }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >市区町村・番地・建物名・フロア</label
              >
              <textarea
                v-model="form.address"
                rows="3"
                placeholder="江戸川区南葛西5-13-10 ヤキベンビル 3F 会議室"
                class="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              ></textarea>
            </div>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {{ isLoading ? '保存中...' : '設定を保存する' }}
            </button>
          </div>

          <!-- Danger Zone -->
          <div class="pt-10 border-t border-red-100">
            <div class="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 class="text-lg font-bold text-red-900 mb-2">アカウントの削除</h3>
              <p class="text-sm text-red-700 mb-4">
                アカウントを削除すると、注文履歴やプロフィール情報にアクセスできなくなります。
                削除後30日間はデータの復旧が可能ですが、それ以降は完全に消去されます。
              </p>
              <button
                type="button"
                @click="handleDeleteAccount"
                :disabled="isLoading"
                class="w-full bg-white text-red-600 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
              >
                アカウントを削除する
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@app/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref<'success' | 'error'>('success');
const authProvider = ref<string>('');

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  corporateName: '',
  postalCode: '',
  prefecture: '',
  address: '', // This will store the full address string for simplicity, or we can split logic if needed
});

const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

onMounted(async () => {
  await loadProfile();
});

async function loadProfile() {
  try {
    isLoading.value = true;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    // Logic to properly detect provider (handles edge case where LINE is mapped as email/google)
    const provider = user.app_metadata.provider || '';
    const identities = user.identities || [];
    const hasLineIdentity = (identities as any[]).some((i: any) => i.provider === 'line' || i.provider === 'oidc');
    const isLinePlaceholder = user.email?.includes('@line.placeholder');

    if (hasLineIdentity || isLinePlaceholder) {
      authProvider.value = 'line';
    } else {
      authProvider.value = provider;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      form.value = {
        firstName: data.f_name || '',
        lastName: data.l_name || '',
        phone: data.tel || '',
        corporateName: data.corporate_name || '',
        postalCode: data.postcode || '',
        // Try to extract prefecture if address string contains it, or use saved field if we had one (schema only has 'address' string usually)
        // For now, let's assume 'address' field in DB holds the full string, we might need to parse or just let user edit
        // Simple approach: DB 'address' is one string. We let user edit it as one block for now in 'address' field
        // BUT ui has prefecture dropdown.
        // Let's rely on user filling it.
        prefecture: '', // We don't strictly separate this in DB schema yet? checks schema..
        address: data.address || '',
      };

      // Simple parse attempt for prefecture
      for (const pref of prefectures) {
        if (data.address && data.address.startsWith(pref)) {
          form.value.prefecture = pref;
          form.value.address = data.address.replace(pref, '').trim();
          break;
        }
      }
    }
  } catch (e: any) {
    console.error('Error loading profile:', e);
    statusMessage.value = 'プロフィールの読み込みに失敗しました';
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}

async function saveProfile() {
  try {
    isLoading.value = true;
    statusMessage.value = '';
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Combine address for DB storage
    // If prefecture is selected, prepend it if not already in address
    let fullAddress = form.value.address;
    if (form.value.prefecture && !fullAddress.includes(form.value.prefecture)) {
      fullAddress = `${form.value.prefecture} ${fullAddress}`;
    }

    const updates = {
      f_name: form.value.firstName,
      l_name: form.value.lastName,
      tel: form.value.phone,
      corporate_name: form.value.corporateName,
      postcode: form.value.postalCode,
      address: fullAddress,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (error) throw error;

    statusMessage.value = 'プロフィールを保存しました';
    statusType.value = 'success';

    // Optional: Refresh data to ensure sync
    // await loadProfile();
  } catch (e: any) {
    console.error('Error saving profile:', e);
    statusMessage.value = '保存に失敗しました: ' + e.message;
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}

async function handleDeleteAccount() {
  const confirmed = window.confirm(
    '本当にアカウントを削除しますか？\n\n削除後30日間はデータの復旧が可能ですが、それ以降は完全に消去されます。'
  );

  if (!confirmed) return;

  try {
    isLoading.value = true;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    await supabase.auth.signOut();
    router.push('/');
    window.location.reload();
  } catch (e: any) {
    console.error('Error deleting account:', e);
    alert('アカウントの削除に失敗しました: ' + e.message);
  } finally {
    isLoading.value = false;
  }
}
</script>
