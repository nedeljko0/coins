import { configureStore, Middleware } from '@reduxjs/toolkit';
import portfolioReducer from './features/portfolio';

const logger: Middleware = store => next => action => {
  console.log('Dispatching:', JSON.stringify(action, null, 2));
  const result = next(action);
  console.log('Next State:', JSON.stringify(store.getState(), null, 2));
  console.log('Is development mode:', __DEV__);
  return result;
};

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
  devTools: __DEV__,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
