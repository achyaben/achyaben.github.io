import { reactive, ref } from 'vue';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { ne } from './locales/ne';

export type Locale = 'en' | 'ja' | 'ne';
export type UiTexts = typeof en;

const locales: Record<Locale, UiTexts> = { en, ja, ne };

/** Reactive current locale — bind to this in components that need to react to changes. */
export const currentLocale = ref<Locale>((localStorage.getItem('admin-locale') as Locale) || 'ja');

/** Reactive UI text object — initialised from saved locale or default (ja). */
export const UI_TEXTS = reactive({ ...locales[currentLocale.value] }) as UiTexts;

/** Apply a locale in-place (no reload). Used internally on startup. */
function applyLocale(locale: Locale): void {
  currentLocale.value = locale;
  Object.assign(UI_TEXTS, locales[locale]);
}

/** Switch locale: persist, then reload so all components reflect the change. */
export function setLocale(locale: Locale): void {
  try {
    localStorage.setItem('admin-locale', locale);
  } catch {
    // localStorage unavailable
  }
  window.location.reload();
}

// Validate the saved value is a known locale; fall back silently if not.
try {
  const saved = localStorage.getItem('admin-locale') as Locale | null;
  if (saved && saved in locales && saved !== currentLocale.value) {
    applyLocale(saved);
  }
} catch {
  // localStorage unavailable — use default locale
}
