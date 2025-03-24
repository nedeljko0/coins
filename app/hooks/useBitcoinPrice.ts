import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { api, HistoricalData } from '../services/api';
import { updateProfitLoss } from '../store/features/portfolio';

const PRICE_REFRESH_INTERVAL = 10000;

interface PriceStats {
  currentPrice: number | null;
  historicalData: number[] | null;
  prevClose: number | null;
  priceChange: {
    value: number | null;
    percentage: number | null;
  };
  isPriceLoading: boolean;
  isHistoricalLoading: boolean;
}

export const useBitcoinPrice = (): PriceStats => {
  const dispatch = useDispatch();

  const { data: currentPrice, isLoading: isPriceLoading } = useQuery({
    queryKey: ['bitcoinPrice'],
    queryFn: api.getCurrentPrice,
    refetchInterval: PRICE_REFRESH_INTERVAL,
  });

  const { data: historicalData, isLoading: isHistoricalLoading } = useQuery({
    queryKey: ['historicalData'],
    queryFn: api.getHistoricalData,
    refetchInterval: PRICE_REFRESH_INTERVAL,
  });

  useEffect(() => {
    if (currentPrice) {
      dispatch(updateProfitLoss(parseFloat(currentPrice.last)));
    }
  }, [currentPrice, dispatch]);

  const calculatePriceStats = (
    current: number | null,
    historical: HistoricalData[] | null,
  ) => {
    if (!current || !historical || historical.length === 0) {
      return {
        prevClose: null,
        priceChange: { value: null, percentage: null },
      };
    }

    const prevClose = historical[0].price; // Assuming first entry is 24h ago
    const change = current - prevClose;
    const changePercentage = (change / prevClose) * 100;

    return {
      prevClose,
      priceChange: {
        value: change,
        percentage: changePercentage,
      },
    };
  };

  const stats = calculatePriceStats(
    currentPrice ? parseFloat(currentPrice.last) : null,
    historicalData || null,
  );

  return {
    currentPrice: currentPrice ? parseFloat(currentPrice.last) : null,
    historicalData: historicalData ? historicalData.map(d => d.price) : null,
    prevClose: stats.prevClose,
    priceChange: stats.priceChange,
    isPriceLoading,
    isHistoricalLoading,
  };
};
