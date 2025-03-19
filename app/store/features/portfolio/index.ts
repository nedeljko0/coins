import { portfolioSlice } from './slice';

export const { executeTrade, updateProfitLoss } = portfolioSlice.actions;
export default portfolioSlice.reducer;

export * from './types';
