import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { checkAuth, login, register, verifyOtp } from "./authApi";

interface User {
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        [key: string]: any;
}

interface AuthStore {
    user: null | User;
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState : AuthStore = {
    user:   null,
    token: null,
    loading: false,
    error: null,
}

export const loginAsync = createAsyncThunk(
    "auth/loginUser", async (cred: {email: string, password: string}) => {
        const res = await login(cred);
        return res.data;
    }
)

export const registerAsync = createAsyncThunk(
    "auth/registerUser", async (cred: {email: string, password: string, confirmPassword: string}) => {
        const res = await register(cred);
        return res.data;
    }
)

export const verifyOtpAsync = createAsyncThunk(
    "auth/verifyOtp", async (cred: {email: string, otp: string})=> {
        const res = await verifyOtp(cred);
        return res.data;
    }
)

export const checkAuthAsync = createAsyncThunk("auth/fetchUserProfile", async() => {
       const res = await checkAuth();
       return res.data;
    }
)

const handlePending = (state: AuthStore) => {
    state.loading = true;
    state.error = null;
}

const handleRejected = (state: AuthStore, action: any) => {
    state.loading = false;
    state.error = action.payload as string;
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout : (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginAsync.pending, handlePending)
        .addCase(loginAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem("token", action.payload.token);
        })
        .addCase(loginAsync.rejected, handleRejected)

        // Profile
        .addCase(checkAuthAsync.pending, handlePending)
        .addCase(checkAuthAsync.fulfilled, (state, action)=> {
            state.loading = false;
            state.error = null;
            state.user = action.payload.user;
        })
        .addCase(checkAuthAsync.rejected, handleRejected)

        // Verify OTP
        .addCase(verifyOtpAsync.pending, handlePending)
        .addCase(verifyOtpAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        })
        .addCase(verifyOtpAsync.rejected, handleRejected);

        // Register User
        builder
        .addCase(registerAsync.pending, handlePending)
        .addCase(registerAsync.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload.user;
        })
        .addCase(registerAsync.rejected, handleRejected)
        
    }
})

export const { logout } = authSlice.actions;

export default authSlice.reducer;