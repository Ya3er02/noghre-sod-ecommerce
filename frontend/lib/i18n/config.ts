import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

/**
 * پیکربندی i18n برای پشتیبانی از سه زبان:
 * - فارسی (fa) - RTL
 * - عربی (ar) - RTL
 * - انگلیسی (en) - LTR
 */
i18n
  .use(Backend) // بارگذاری ترجمه‌ها از فایل
  .use(LanguageDetector) // تشخیص خودکار زبان
  .use(initReactI18next) // یکپارچه‌سازی با React
  .init({
    // زبان پیش‌فرض
    fallbackLng: 'fa',
    
    // زبان‌های پشتیبانی شده
    supportedLngs: ['fa', 'ar', 'en'],
    
    // فضای نام برای سازماندهی ترجمه‌ها
    ns: ['common', 'product', 'auth', 'checkout', 'dashboard'],
    defaultNS: 'common',
    
    // تنظیمات Backend
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
    },
    
    // تنظیمات تشخیص زبان
    detection: {
      // اولویت تشخیص
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // ذخیره‌سازی در localStorage
      caches: ['localStorage'],
      
      // کلید localStorage
      lookupLocalStorage: 'i18nextLng',
    },
    
    // تنظیمات Interpolation
    interpolation: {
      escapeValue: false, // React خود XSS safe است
      
      // فرمت‌کننده‌های سفارشی
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          const currency = lng === 'en' ? 'USD' : lng === 'ar' ? 'AED' : 'IRR';
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
        }
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        return value;
      },
    },
    
    // تنظیمات React
    react: {
      useSuspense: true, // استفاده از Suspense برای loading
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // تنظیمات Debug (فقط در development)
    debug: process.env.NODE_ENV === 'development',
    
    // بازگشت کلید وقتی ترجمه پیدا نشد
    saveMissing: false,
    
    // تنظیمات جداکننده Namespace
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;

/**
 * هلپر برای تغییر زبان و اعمال تغییرات
 */
export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  
  // تنظیم جهت RTL/LTR
  const dir = ['fa', 'ar'].includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  
  // ذخیره‌سازی
  localStorage.setItem('i18nextLng', lng);
  localStorage.setItem('direction', dir);
  
  // بروزرسانی صفحه برای اعمال تغییرات CSS
  window.dispatchEvent(new Event('languageChanged'));
};

/**
 * هلپر برای دریافت جهت فعلی
 */
export const getCurrentDirection = (): 'rtl' | 'ltr' => {
  const lng = i18n.language;
  return ['fa', 'ar'].includes(lng) ? 'rtl' : 'ltr';
};

/**
 * هلپر برای دریافت نام زبان به زبان مقصد
 */
export const getLanguageName = (code: string): string => {
  const names: Record<string, Record<string, string>> = {
    fa: { fa: 'فارسی', ar: 'الفارسیة', en: 'Persian' },
    ar: { fa: 'عربی', ar: 'العربية', en: 'Arabic' },
    en: { fa: 'انگلیسی', ar: 'الإنجليزية', en: 'English' },
  };
  
  const currentLng = i18n.language || 'fa';
  return names[code]?.[currentLng] || code;
};
