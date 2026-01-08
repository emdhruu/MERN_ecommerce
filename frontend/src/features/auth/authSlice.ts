import { createAsyncThunk, createSlice, type SerializedError } from "@reduxjs/toolkit";
import { checkAuth, login, register, verifyOtp } from "./authApi";

interface AuthStore {
    status: "idle" | "pending" | "fulfilled" | "rejected";
    errors: SerializedError | null;
    loginStatus: "idle" | "pending" | "fulfilled" | "rejected";
    loginError: SerializedError | null;
    loggedInUser: any | null;
    registerStatus: "idle" | "pending" | "fulfilled" | "rejected";
    registerError: SerializedError | null;
    otpVerificationStatus: "idle" | "pending" | "fulfilled" | "rejected";
    otpVerificationError: SerializedError | null;
    isAuthChecked: boolean;
    savedToken: string | null;
    logoutStatus: "idle" | "pending" | "fulfilled" | "rejected";
    logoutError: SerializedError | null;
}

const initialState : AuthStore = {
    status:"idle",
    errors: null,
    loginStatus: "idle",
    loginError: null,
    loggedInUser: null,
    registerStatus: "idle",
    registerError: null,
    otpVerificationStatus: "idle",
    otpVerificationError: null,
    isAuthChecked: false,
    savedToken: localStorage.getItem("token") || null,
    logoutStatus: "idle",
    logoutError: null,
}

export const loginAsync = createAsyncThunk(
    "auth/loginUser", async (cred: {email: string, password: string}) => {
        const res = await login(cred);
        return res;
    }
)

export const registerAsync = createAsyncThunk(
    "auth/registerUser", async (cred: {name: string, email: string, password: string}) => {
        const res = await register(cred);
        return res;
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

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.loggedInUser = null;
            state.savedToken = null;
            localStorage.removeItem("token");
        },
        resetLoginStatus: (state) => {
            state.loginStatus = "idle";
        },
        clearLoginError: (state) => {
            state.loginError = null;
        },
        resetRegisterStatus: (state) => {
            state.registerStatus = "idle";
        },
        clearRegisterError: (state) => {
            state.registerError = null;
        },
        resetOtpVerificationStatus: (state) => {
            state.otpVerificationStatus = "idle";
        },
        clearOtpVerificationError: (state) => {
            state.otpVerificationError = null;
        },
        clearStatus: (state) => {
            state.status = "idle";
        },
        clearErrors: (state) => {
            state.errors = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Login User
        .addCase(loginAsync.pending, (state)=> {
            state.loginStatus = "pending";
        })
        .addCase(loginAsync.fulfilled, (state, action) => {
            state.loginStatus = "fulfilled";
            state.loggedInUser = action.payload.user;
            state.savedToken = action.payload.token;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("pendingVerification", "true");
        })
        .addCase(loginAsync.rejected, (state, action) => {
            state.loginStatus = "rejected";
            state.loginError = action.error;
        })
        // Register User
        .addCase(registerAsync.pending, (state)=> {
            state.registerStatus = "pending";
        })
        .addCase((registerAsync.fulfilled), (state, action) => {
            state.registerStatus = "fulfilled";
            state.loggedInUser = action.payload;
            localStorage.setItem("pendingVerification", "true");
        })
        .addCase(registerAsync.rejected, (state, action)=> {
            state.registerStatus = "rejected";
            state.registerError = action.error;
        })
        // Get Profile
        .addCase(checkAuthAsync.pending, (state)=> {
            state.status = "pending";
        })
        .addCase(checkAuthAsync.fulfilled, (state, action)=> {
            state.status = "fulfilled";
            state.loggedInUser = action.payload;
            state.isAuthChecked = true;
        })
        .addCase(checkAuthAsync.rejected, (state, action)=> {
            state.status = "rejected";
            state.errors = action.error;
            state.isAuthChecked = true;
        })
        // Verify OTP
        .addCase(verifyOtpAsync.pending, (state) => {
            state.otpVerificationStatus = "pending";
        })
        .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.otpVerificationStatus = "fulfilled";
        state.loggedInUser = action.payload.user;
        state.savedToken = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        })
        .addCase(verifyOtpAsync.rejected, (state, action)=> {
            state.otpVerificationStatus = "rejected";
            state.otpVerificationError = action.error;
        });
    }
})

// export const selectLoginStatus = (state: ) => state.auth.loginStatus;

export const { logout, resetLoginStatus, clearLoginError, clearRegisterError, resetRegisterStatus, resetOtpVerificationStatus, clearOtpVerificationError, clearStatus, clearErrors } = authSlice.actions;

export default authSlice.reducer;