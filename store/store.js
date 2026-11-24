import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import uiReducer from './slices/uiSlice';

export function makeStore() {
    return configureStore({
        reducer: {
            ui: uiReducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(baseApi.middleware),
    });
}
