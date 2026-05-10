import { createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
}

type AuthState = "idle" | "pending" | "authenticated";

interface AuthStore {
    user: User | null;
    accessToken: string | null;
    status: AuthState;
    isInitialized: boolean;
}

const storedToken = sessionStorage.getItem("accessToken");
const storedUser = sessionStorage.getItem("user");

const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

const tokenValid = storedToken && !isTokenExpired(storedToken);

const initialState : AuthStore = {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: tokenValid ? storedToken : null,
    status: tokenValid ? "authenticated" : "idle",
    isInitialized: !!tokenValid,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.status = "idle";
            state.isInitialized = true;
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("user");
        },
        setAuthenticatedUser: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.status = "authenticated";
            state.isInitialized = true;
            sessionStorage.setItem("accessToken", action.payload.accessToken);
            sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        setPendingUser: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            state.accessToken = null;
            state.status = "pending";
            sessionStorage.removeItem("accessToken");
            sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        setResetState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.status = "idle";
            state.isInitialized = true;
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("user");
        },
        setAuthCheckComplete: (state) => {
            if (!state.user) {
                state.isInitialized = false;
            }
        }
    },
})

export const { logout, setAuthenticatedUser, setPendingUser, setResetState, setAuthCheckComplete } = authSlice.actions;

export default authSlice.reducer;