import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState } from './types';

const initialState: PortfolioState = {
  balance: 10000,
  btcAmount: 0,
  transactions: [],
  profitLoss: 0,
};

const calculateInvested = (
  transactions: PortfolioState['transactions'],
): number => {
  return transactions.reduce((acc, transaction) => {
    const value = transaction.amount * transaction.price;
    return transaction.type === 'buy' ? acc + value : acc - value;
  }, 0);
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    executeTrade: (
      state,
      action: PayloadAction<{
        type: 'buy' | 'sell';
        amount: number;
        price: number;
      }>,
    ) => {
      const { type, amount, price } = action.payload;
      if (amount <= 0 || price <= 0) {
        return;
      }

      const total = amount * price;
      const canExecute =
        type === 'buy' ? state.balance >= total : state.btcAmount >= amount;

      if (canExecute) {
        if (type === 'buy') {
          state.balance -= total;
          state.btcAmount += amount;
        } else {
          state.balance += total;
          state.btcAmount -= amount;
        }

        state.transactions.push({
          id: Date.now().toString(),
          type,
          amount,
          price,
          timestamp: Date.now(),
        });
      }
    },
    updateProfitLoss: (state, action: PayloadAction<number>) => {
      const currentPrice = action.payload;
      const totalValue = state.btcAmount * currentPrice;
      const invested = calculateInvested(state.transactions);
      state.profitLoss = totalValue - invested;
    },
  },
});
