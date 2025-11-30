import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface SilverPrice {
  usd: number;
  irt: number; // Iranian Toman
  timestamp: Date;
  change24h: number;
  changePercent24h: number;
}

/**
 * Hook for real-time silver spot price
 * Updates every 60 seconds for fresh pricing
 */
export function useSilverPrice() {
  return useQuery<SilverPrice>({
    queryKey: ['silver-price'],
    queryFn: () => api.prices.getSilverSpot(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for historical silver price chart data
 */
export function useSilverPriceHistory(
  period: '24h' | '7d' | '30d' | '1y' = '7d'
) {
  return useQuery({
    queryKey: ['silver-price-history', period],
    queryFn: () => api.prices.getSilverHistory(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for calculating product price based on silver weight
 */
export function useProductPricing(weight: number, purity: '925' | '999' = '925') {
  const { data: silverPrice } = useSilverPrice();
  const [pricing, setPricing] = useState<{
    silverValue: number;
    craftingCost: number;
    markup: number;
    finalPrice: number;
  } | null>(null);

  useEffect(() => {
    if (!silverPrice) return;

    // Calculate pure silver content
    const purityMultiplier = purity === '925' ? 0.925 : 0.999;
    const pureSilverGrams = weight * purityMultiplier;

    // Silver value in IRT
    const silverValue = (pureSilverGrams * silverPrice.irt) / 31.1035; // Convert to grams

    // Crafting cost (20% of silver value)
    const craftingCost = silverValue * 0.2;

    // Business markup (30%)
    const markup = (silverValue + craftingCost) * 0.3;

    // Final price
    const finalPrice = silverValue + craftingCost + markup;

    setPricing({
      silverValue,
      craftingCost,
      markup,
      finalPrice: Math.round(finalPrice / 1000) * 1000, // Round to nearest 1000
    });
  }, [silverPrice, weight, purity]);

  return pricing;
}

/**
 * Hook for price change notifications
 */
export function usePriceAlert(threshold: number = 5) {
  const { data: currentPrice } = useSilverPrice();
  const [alert, setAlert] = useState<{
    type: 'increase' | 'decrease' | null;
    percent: number;
  }>({ type: null, percent: 0 });

  useEffect(() => {
    if (!currentPrice) return;

    const changePercent = Math.abs(currentPrice.changePercent24h);
    
    if (changePercent >= threshold) {
      setAlert({
        type: currentPrice.changePercent24h > 0 ? 'increase' : 'decrease',
        percent: changePercent,
      });

      // Show notification
      // toast.info(
      //   `قیمت نقره ${currentPrice.changePercent24h > 0 ? 'افزایش' : 'کاهش'} ${changePercent.toFixed(1)}٪ داشته است`
      // );
    }
  }, [currentPrice, threshold]);

  return alert;
}
