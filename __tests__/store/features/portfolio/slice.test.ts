import { portfolioSlice } from '../../../../app/store/features/portfolio/slice';
import { PortfolioState } from '../../../../app/store/features/portfolio/types';

const { executeTrade } = portfolioSlice.actions;

describe('portfolioSlice', () => {
  let initialState: PortfolioState;

  beforeEach(() => {
    initialState = {
      balance: 10000,
      btcAmount: 0,
      transactions: [],
      profitLoss: 0,
    };
  });

  describe('executeTrade reducer', () => {
    it('should handle buying BTC successfully', () => {
      const action = executeTrade({ type: 'buy', amount: 1, price: 5000 });
      const state = portfolioSlice.reducer(initialState, action);

      expect(state.balance).toBe(5000); // 10000 - (1 * 5000)
      expect(state.btcAmount).toBe(1);
      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0]).toMatchObject({
        type: 'buy',
        amount: 1,
        price: 5000,
      });
      expect(state.profitLoss).toBe(0); // No profit/loss on buy
    });

    it('should handle selling BTC successfully and calculate profit', () => {
      // First buy some BTC
      const buyAction = executeTrade({ type: 'buy', amount: 2, price: 4000 });
      let state = portfolioSlice.reducer(initialState, buyAction);

      // Then sell part of it at a profit
      const sellAction = executeTrade({ type: 'sell', amount: 1, price: 5000 });
      state = portfolioSlice.reducer(state, sellAction);

      expect(state.balance).toBe(7000); // 10000 - (2 * 4000) + (1 * 5000)
      expect(state.btcAmount).toBe(1);
      expect(state.transactions).toHaveLength(2);
      expect(state.transactions[0]).toMatchObject({
        type: 'sell',
        amount: 1,
        price: 5000,
      });
      expect(state.profitLoss).toBe(1000); // Sold 1 BTC at 1000 profit (5000 - 4000)
    });

    it('should handle selling BTC at a loss', () => {
      // First buy some BTC
      const buyAction = executeTrade({ type: 'buy', amount: 1, price: 5000 });
      let state = portfolioSlice.reducer(initialState, buyAction);

      // Then sell at a loss
      const sellAction = executeTrade({ type: 'sell', amount: 1, price: 4000 });
      state = portfolioSlice.reducer(state, sellAction);

      expect(state.balance).toBe(9000); // 10000 - 5000 + 4000
      expect(state.btcAmount).toBe(0);
      expect(state.profitLoss).toBe(-1000); // Lost 1000 on the trade
    });

    it('should accumulate profit/loss from multiple trades', () => {
      // Buy 2 BTC at 4000
      let state = portfolioSlice.reducer(
        initialState,
        executeTrade({ type: 'buy', amount: 2, price: 4000 }),
      );

      // Sell 1 BTC at 5000 (profit: 1000)
      state = portfolioSlice.reducer(
        state,
        executeTrade({ type: 'sell', amount: 1, price: 5000 }),
      );

      // Sell 1 BTC at 3000 (loss: 1000)
      state = portfolioSlice.reducer(
        state,
        executeTrade({ type: 'sell', amount: 1, price: 3000 }),
      );

      expect(state.profitLoss).toBe(0); // Total P&L should be 0 (1000 profit - 1000 loss)
      expect(state.btcAmount).toBe(0);
      expect(state.balance).toBe(10000); // Back to initial balance
    });

    it('should not execute buy trade if insufficient balance', () => {
      const action = executeTrade({ type: 'buy', amount: 3, price: 4000 });
      const state = portfolioSlice.reducer(initialState, action);

      expect(state).toEqual(initialState); // State should remain unchanged
    });

    it('should not execute sell trade if insufficient BTC', () => {
      const action = executeTrade({ type: 'sell', amount: 1, price: 5000 });
      const state = portfolioSlice.reducer(initialState, action);

      expect(state).toEqual(initialState); // State should remain unchanged
    });

    it('should not execute trade with invalid amounts', () => {
      const negativeAmount = executeTrade({
        type: 'buy',
        amount: -1,
        price: 5000,
      });
      const zeroAmount = executeTrade({ type: 'buy', amount: 0, price: 5000 });
      const negativePrice = executeTrade({
        type: 'buy',
        amount: 1,
        price: -5000,
      });
      const zeroPrice = executeTrade({ type: 'buy', amount: 1, price: 0 });

      const states = [
        portfolioSlice.reducer(initialState, negativeAmount),
        portfolioSlice.reducer(initialState, zeroAmount),
        portfolioSlice.reducer(initialState, negativePrice),
        portfolioSlice.reducer(initialState, zeroPrice),
      ];

      states.forEach(state => {
        expect(state).toEqual(initialState); // All should remain unchanged
      });
    });
  });
});
