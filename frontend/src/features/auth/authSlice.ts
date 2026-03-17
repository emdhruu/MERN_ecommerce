import { createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
}

interface AuthStore {
    loggedInUser: User | null;
    isAuthChecked: boolean;
    savedToken: string | null;
}

const initialState : AuthStore = {
    loggedInUser: null,
    isAuthChecked: false,
    savedToken: localStorage.getItem("accessToken") || null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.loggedInUser = null;
            state.savedToken = null;
            state.isAuthChecked = false;
            localStorage.removeItem("accessToken");
        },
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.loggedInUser = action.payload.user;
            state.savedToken = action.payload.accessToken;
            localStorage.setItem("accessToken", action.payload.accessToken);
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.loggedInUser = action.payload;
            state.isAuthChecked = true;
        }
    },
})

// export const selectLoginStatus = (state: ) => state.auth.loginStatus;

export const { logout, setCredentials, setUser } = authSlice.actions;

export default authSlice.reducer;