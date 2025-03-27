import { portfolioSlice } from '../../../../app/store/features/portfolio/slice';
import { PortfolioState } from '../../../../app/store/features/portfolio/types';

const { executeTrade, updateProfitLoss } = portfolioSlice.actions;

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
    });

    it('should handle selling BTC successfully', () => {
      // First buy some BTC
      const buyAction = executeTrade({ type: 'buy', amount: 2, price: 4000 });
      let state = portfolioSlice.reducer(initialState, buyAction);

      // Then sell part of it
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

  describe('updateProfitLoss reducer', () => {
    it('should calculate profit/loss correctly with no transactions', () => {
      const action = updateProfitLoss(50000);
      const state = portfolioSlice.reducer(initialState, action);

      expect(state.profitLoss).toBe(0);
    });

    it('should calculate profit/loss correctly after buying', () => {
      // First buy some BTC
      let state = portfolioSlice.reducer(
        initialState,
        executeTrade({ type: 'buy', amount: 2, price: 4000 }),
      );

      // Update with new price
      state = portfolioSlice.reducer(state, updateProfitLoss(5000));

      // Invested: 8000 (2 BTC * 4000)
      // Current value: 10000 (2 BTC * 5000)
      // Profit/Loss: 2000
      expect(state.profitLoss).toBe(2000);
    });

    it('should calculate profit/loss correctly after multiple trades', () => {
      // Buy 2 BTC at 4000
      let state = portfolioSlice.reducer(
        initialState,
        executeTrade({ type: 'buy', amount: 2, price: 4000 }),
      );

      // Sell 1 BTC at 5000
      state = portfolioSlice.reducer(
        state,
        executeTrade({ type: 'sell', amount: 1, price: 5000 }),
      );

      // Update price to 6000
      state = portfolioSlice.reducer(state, updateProfitLoss(6000));

      // Initial investment: 8000 (2 BTC * 4000)
      // Sold: 5000 (1 BTC * 5000)
      // Remaining: 1 BTC
      // Current value: 6000 (1 BTC * 6000)
      // Net investment: 3000 (8000 - 5000)
      // Profit/Loss: 3000 (6000 - 3000)
      expect(state.profitLoss).toBe(3000);
    });
  });
});
