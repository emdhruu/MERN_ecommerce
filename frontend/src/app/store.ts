import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/app/apiSlice";
import authSlice from "../features/auth/authSlice";
import productSlice from "../features/adminPanel/product/productSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        product: productSlice,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;