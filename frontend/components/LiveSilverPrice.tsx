import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useCurrencyFormatter, useNumberFormatter } from '../lib/formatters';

interface SilverPriceData {
  usd: number;
  irr: number;
  aed: number;
  perGram: {
    usd: number;
    irr: number;
    aed: number;
  };
  change24h: number;
  changePercent24h: number;
  lastUpdate: string;
}

export function LiveSilverPrice() {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDecimal } = useNumberFormatter();

  const { data: price, isLoading, refetch, isRefetching } = useQuery<SilverPriceData>({
    queryKey: ['silver-price'],
    queryFn: async () => {
      const res = await fetch('/api/price/current');
      if (!res.ok) throw new Error('Failed to fetch price');
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // بروزرسانی هر 5 دقیقه
    staleTime: 4 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="card__body">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!price) return null;

  const isPositive = price.changePercent24h >= 0;
  const currency = i18n.language === 'en' ? 'usd' : i18n.language === 'ar' ? 'aed' : 'irr';
  const displayPrice = price[currency];
  const displayPricePerGram = price.perGram[currency];

  return (
    <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-primary/20">
      <div className="card__body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('product:silver_price_live')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('product:per_ounce')} (31.1 {t('units.gram')})
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn--secondary btn--sm"
            aria-label="Refresh price"
          >
            <RefreshCw
              size={16}
              className={isRefetching ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* Main Price */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {formatCurrency(displayPrice)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(displayPricePerGram)} / {t('units.gram')}
            </p>
          </div>

          {/* 24h Change */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isPositive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <div className="text-right">
              <p className="font-bold text-lg">
                {isPositive ? '+' : ''}{formatDecimal(price.changePercent24h, 2)}%
              </p>
              <p className="text-xs opacity-80">{t('product:change_24h')}</p>
            </div>
          </div>
        </div>

        {/* Price in Other Currencies */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('currency.usd')}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              ${formatDecimal(price.usd, 2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('currency.aed')}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatDecimal(price.aed, 2)} د.إ
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t('currency.irr')}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatDecimal(price.irr / 1000, 0)}ک
            </p>
          </div>
        </div>

        {/* Last Update */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('product:last_update')}:{' '}
            {new Date(price.lastUpdate).toLocaleTimeString(i18n.language)}
          </p>
        </div>
      </div>
    </div>
  );
}
