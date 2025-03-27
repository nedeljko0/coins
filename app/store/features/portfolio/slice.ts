import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState } from './types';

const initialState: PortfolioState = {
  balance: 10000,
  btcAmount: 0,
  transactions: [],
  profitLoss: 0,
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
          // For sells, calculate profit/loss based on the difference from previous trades
          const lastBuyPrice =
            state.transactions.find(t => t.type === 'buy')?.price || price;
          state.profitLoss += amount * (price - lastBuyPrice);
        }

        state.transactions.unshift({
          id: Date.now().toString(),
          type,
          amount,
          price,
          timestamp: Date.now(),
        });
      }
    },
  },
});

export const { executeTrade } = portfolioSlice.actions;
export default portfolioSlice.reducer;
