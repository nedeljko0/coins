import axios from 'axios';

const BITSTAMP_API_BASE = 'https://www.bitstamp.net/api/v2';

export interface BitcoinPrice {
  last: string;
  high: string;
  low: string;
  timestamp: string;
}

export interface HistoricalData {
  timestamp: number;
  price: number;
}

export const api = {
  getCurrentPrice: async (): Promise<BitcoinPrice> => {
    const response = await axios.get(`${BITSTAMP_API_BASE}/ticker/btceur/`);
    return response.data;
  },

  getHistoricalData: async (): Promise<HistoricalData[]> => {
    // Use 30-minute intervals (1800 seconds) for the past 24 hours
    const response = await axios.get(
      `${BITSTAMP_API_BASE}/ohlc/btceur/?step=1800&limit=48`,
    );

    if (response.data && response.data.data && response.data.data.ohlc) {
      // Map to our historical data format, using the closing price
      return response.data.data.ohlc.map((item: any) => ({
        timestamp: parseInt(item.timestamp, 10) * 1000,
        price: parseFloat(item.close),
      }));
    }

    return [];
  },
};
