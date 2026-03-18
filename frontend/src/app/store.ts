import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/app/apiSlice";
import authSlice from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;