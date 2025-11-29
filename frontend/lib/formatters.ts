import { useTranslation } from 'react-i18next';

/**
 * Hook برای فرمت کردن ارزها
 */
export function useCurrencyFormatter() {
  const { i18n } = useTranslation();

  const formatCurrency = (
    amount: number,
    currency?: 'IRR' | 'USD' | 'AED'
  ): string => {
    // انتخاب ارز بر اساس زبان
    const defaultCurrency = currency || getDefaultCurrency(i18n.language);

    // لوکیل مناسب برای هر زبان
    const locale = getLocale(i18n.language);

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: defaultCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: defaultCurrency === 'IRR' ? 0 : 2,
      }).format(amount);
    } catch (error) {
      // Fallback برای مرورگرهای قدیمی
      return `${amount.toLocaleString(locale)} ${getCurrencySymbol(defaultCurrency)}`;
    }
  };

  return { formatCurrency };
}

/**
 * Hook برای فرمت کردن اعداد
 */
export function useNumberFormatter() {
  const { i18n } = useTranslation();

  const formatNumber = (
    number: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    const locale = getLocale(i18n.language);

    return new Intl.NumberFormat(locale, options).format(number);
  };

  const formatDecimal = (number: number, decimals: number = 2): string => {
    return formatNumber(number, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercentage = (number: number, decimals: number = 1): string => {
    return formatNumber(number / 100, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return { formatNumber, formatDecimal, formatPercentage };
}

/**
 * Hook برای فرمت کردن تاریخ و زمان
 */
export function useDateFormatter() {
  const { i18n } = useTranslation();

  const formatDate = (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const locale = getLocale(i18n.language);
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    // برای فارسی از تقویم شمسی استفاده کن
    const calendar = i18n.language === 'fa' ? 'persian' : 'gregory';
    const localeWithCalendar = `${locale}-u-ca-${calendar}`;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(localeWithCalendar, defaultOptions).format(dateObj);
  };

  const formatTime = (date: Date | string | number): string => {
    const locale = getLocale(i18n.language);
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const formatDateTime = (date: Date | string | number): string => {
    return `${formatDate(date)} - ${formatTime(date)}`;
  };

  const formatRelativeTime = (date: Date | string | number): string => {
    const locale = getLocale(i18n.language);
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  };

  return { formatDate, formatTime, formatDateTime, formatRelativeTime };
}

/**
 * Helper Functions
 */
function getLocale(language: string): string {
  const localeMap: Record<string, string> = {
    fa: 'fa-IR',
    ar: 'ar-AE',
    en: 'en-US',
  };

  return localeMap[language] || 'fa-IR';
}

function getDefaultCurrency(language: string): 'IRR' | 'USD' | 'AED' {
  const currencyMap: Record<string, 'IRR' | 'USD' | 'AED'> = {
    fa: 'IRR',
    ar: 'AED',
    en: 'USD',
  };

  return currencyMap[language] || 'IRR';
}

function getCurrencySymbol(currency: string): string {
  const symbolMap: Record<string, string> = {
    IRR: 'ریال',
    USD: '$',
    AED: 'د.إ',
  };

  return symbolMap[currency] || currency;
}
