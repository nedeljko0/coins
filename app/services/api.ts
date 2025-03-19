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
    const response = await axios.get(
      `${BITSTAMP_API_BASE}/transactions/btceur/`,
    );
    return response.data.map((item: any) => ({
      timestamp: parseInt(item.date, 10) * 1000,
      price: parseFloat(item.price),
    }));
  },
};
