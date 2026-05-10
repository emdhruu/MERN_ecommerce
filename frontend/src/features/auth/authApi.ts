import { apiSlice } from "@/app/apiSlice";
import { setAuthenticatedUser, setPendingUser, logout } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkAuth: builder.query({
            query: () => ({
                url: '/auth/profile',
                method: 'GET'
            }),
            
            async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data } = await queryFulfilled;
                    const currentState = getState() as any;
                    const currentAccessToken = currentState.auth?.accessToken;
                    
                    dispatch(setAuthenticatedUser({ 
                        user: data.data, 
                        accessToken: currentAccessToken || '' 
                    }));
                } catch (error: any) {
                }
            }
        }),

        login: builder.mutation({
            query: (cred: {email: string, password: string}) => ({
                url: '/auth/login',
                method: 'POST',
                body: cred
            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAuthenticatedUser(data));
                } catch (error: any) {
                    const errData = error?.error?.data;
                    if (errData?.requiresVerification) {
                        dispatch(setPendingUser({ user: errData.user }));
                    }
                }
            }
        }),

        registerUser: builder.mutation({
            query: (cred: {name:string, email: string, password: string}) => ({
                url: '/auth/register',
                method: 'POST',
                body: cred
            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setPendingUser(data));
                    
                } catch (error: any) {
                }
            }
        }),

        verifyOtp: builder.mutation({
            query: (cred: {email: string, otp: string}) => ({
                url: '/auth/verifyOtp',
                method: 'POST',
                body: cred
            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAuthenticatedUser(data));
                } catch (error) {
                }
            }
        }),

        resendOtp: builder.mutation({
            query: (cred: {email: string}) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: cred
            })
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    dispatch(logout());
                    await queryFulfilled;
                } catch (error) {
                }
            }
        }),

        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAuthenticatedUser(data));
                } catch (error) {
                    dispatch(logout());
                }
            }
        }),

        updateProfile: builder.mutation({
            query: (body: { name: string }) => ({
                url: '/auth/updateProfile',
                method: 'PUT',
                body
            }),
        }),

        changePassword: builder.mutation({
            query: (body: { currentPassword: string; newPassword: string }) => ({
                url: '/auth/changePassword',
                method: 'PUT',
                body
            }),
        }),
    })
});

export const {
    useCheckAuthQuery,
    useLoginMutation,
    useRegisterUserMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
} = authApi;
