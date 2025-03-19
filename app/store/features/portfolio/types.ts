export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
}

export interface PortfolioState {
  balance: number;
  btcAmount: number;
  transactions: Transaction[];
  profitLoss: number;
}
