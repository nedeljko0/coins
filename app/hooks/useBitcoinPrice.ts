import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useDispatch } from 'react-redux';
import { api, HistoricalData } from '../services/api';
import { useQuery } from '@tanstack/react-query';

const { BitcoinPriceModule } = NativeModules;

if (!BitcoinPriceModule) {
  console.error('[useBitcoinPrice] BitcoinPriceModule is not available');
}

const eventEmitter = new NativeEventEmitter(BitcoinPriceModule);

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
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const { data: historicalDataFromAPI, isLoading: isHistoricalLoading } =
    useQuery({
      queryKey: ['historicalData'],
      queryFn: api.getHistoricalData,
      refetchInterval: 10000,
    });

  useEffect(() => {
    console.log('[useBitcoinPrice] Setting up Bitcoin price listener');

    if (!BitcoinPriceModule) {
      console.error(
        '[useBitcoinPrice] Cannot setup listener - module not available',
      );
      return;
    }

    // Start observing price updates
    BitcoinPriceModule.startObserving()
      .then(() => {
        console.log('[useBitcoinPrice] Successfully started observing');
      })
      .catch((error: Error) => {
        console.error('[useBitcoinPrice] Failed to start observing:', error);
      });

    const priceSubscription = eventEmitter.addListener(
      'onPriceUpdate',
      (price: number) => {
        console.log('[useBitcoinPrice] Received price update:', price);
        setCurrentPrice(price);
      },
    );

    const connectionSubscription = eventEmitter.addListener(
      'onConnectionStateChange',
      (state: string) => {
        console.log('[useBitcoinPrice] Connection state changed:', state);
      },
    );

    return () => {
      console.log('Cleaning up Bitcoin price listener');
      priceSubscription.remove();
      connectionSubscription.remove();
    };
  }, [dispatch]);

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

    const prevClose = historical[0].price;
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
    currentPrice,
    historicalDataFromAPI || null,
  );

  return {
    currentPrice,
    historicalData: historicalDataFromAPI
      ? historicalDataFromAPI.map(d => d.price)
      : null,
    prevClose: stats.prevClose,
    priceChange: stats.priceChange,
    isPriceLoading: !currentPrice,
    isHistoricalLoading,
  };
};
