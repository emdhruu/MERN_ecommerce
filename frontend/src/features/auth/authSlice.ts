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
}

const initialState : AuthStore = {
    user: null,
    accessToken: null,
    status: "idle",
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.status = "idle";
        },
        setAuthenticatedUser: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.status = "authenticated"
        },
        setPendingUser: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            state.accessToken = null;
            state.status = "pending";
        },
        setResetState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.status = "idle";
        }
    },
})

// export const selectLoginStatus = (state: ) => state.auth.loginStatus;

export const { logout, setAuthenticatedUser, setPendingUser , setResetState } = authSlice.actions;

export default authSlice.reducer;