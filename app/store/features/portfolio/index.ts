import { portfolioSlice } from './slice';

export const { executeTrade } = portfolioSlice.actions;
export default portfolioSlice.reducer;

export * from './types';
