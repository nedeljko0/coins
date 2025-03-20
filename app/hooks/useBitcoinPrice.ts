import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '../services/api';
import { updateProfitLoss } from '../store/features/portfolio';

const PRICE_REFRESH_INTERVAL = 10000;

export const useBitcoinPrice = () => {
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

  return {
    currentPrice: currentPrice ? parseFloat(currentPrice.last) : null,
    historicalData: historicalData ? historicalData.map(d => d.price) : null,
    isPriceLoading,
    isHistoricalLoading,
  };
};
