import { configureStore, Middleware, Action } from '@reduxjs/toolkit';
import portfolioReducer from './features/portfolio';

const logger: Middleware = store => next => action => {
  if (__DEV__) {
    console.group((action as Action).type);
    console.info('dispatching', action);
    const result = next(action);
    console.info('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
