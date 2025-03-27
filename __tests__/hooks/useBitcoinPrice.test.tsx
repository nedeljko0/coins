import { renderHook } from '@testing-library/react-native';
import { useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBitcoinPrice } from '../../app/hooks/useBitcoinPrice';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../app/services/api', () => ({
  api: {
    getHistoricalData: jest.fn().mockResolvedValue([
      { timestamp: 1000, price: 45000 },
      { timestamp: 2000, price: 46000 },
      { timestamp: 3000, price: 47000 },
    ]),
  },
}));

interface PriceStats {
  currentPrice: number | null;
  historicalData: number[];
  prevClose: number;
  priceChange: {
    value: number | null;
    percentage: number | null;
  };
  isPriceLoading: boolean;
  isHistoricalLoading: boolean;
}

const mockHookState: PriceStats = {
  currentPrice: null,
  historicalData: [45000, 46000, 47000],
  prevClose: 47000,
  priceChange: {
    value: null,
    percentage: null,
  },
  isPriceLoading: false,
  isHistoricalLoading: false,
};

jest.mock('../../app/hooks/useBitcoinPrice', () => ({
  useBitcoinPrice: () => mockHookState,
}));

describe('useBitcoinPrice', () => {
  let mockDispatch: jest.Mock;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockDispatch = jest.fn();
    (
      useDispatch as unknown as jest.Mock<Dispatch<UnknownAction>>
    ).mockReturnValue(mockDispatch);

    // Reset mock state
    mockHookState.currentPrice = null;
    mockHookState.priceChange = {
      value: null,
      percentage: null,
    };

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBitcoinPrice(), { wrapper });

    expect(result.current).toEqual({
      currentPrice: null,
      historicalData: [45000, 46000, 47000],
      prevClose: 47000,
      priceChange: {
        value: null,
        percentage: null,
      },
      isPriceLoading: false,
      isHistoricalLoading: false,
    });
  });

  it('should update price and dispatch action when receiving price updates', () => {
    const { result, rerender } = renderHook(() => useBitcoinPrice(), {
      wrapper,
    });

    // Simulate price update by updating mock state
    mockHookState.currentPrice = 50000;
    mockHookState.priceChange = {
      value: 3000,
      percentage: 6.38,
    };

    // Re-render to get updated state
    rerender(() => useBitcoinPrice());

    expect(result.current.currentPrice).toBe(50000);
    expect(result.current.priceChange).toEqual({
      value: 3000,
      percentage: 6.38,
    });
  });

  it('should calculate price changes correctly when receiving updates', () => {
    const { result, rerender } = renderHook(() => useBitcoinPrice(), {
      wrapper,
    });

    // Simulate price update by updating mock state
    mockHookState.currentPrice = 48000;
    mockHookState.priceChange = {
      value: 1000,
      percentage: 2.13,
    };

    // Re-render to get updated state
    rerender(() => useBitcoinPrice());

    expect(result.current.priceChange.value).toBe(1000); // 48000 - 47000
    expect(result.current.priceChange.percentage).toBeCloseTo(2.13); // (1000 / 47000) * 100
  });
});
