import { apiSlice } from "@/app/apiSlice";
import { setCredentials, setUser } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkAuth: builder.query({
            query: () => ({
                url: '/auth/profile',
                method: 'GET'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) {}
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
                    dispatch(setCredentials(data));
                } catch (error) {}
            }
        }),

        registerUser: builder.mutation({
            query: (cred: {name:string, email: string, password: string}) => ({
                url: '/auth/register',
                method: 'POST',
                body: cred
            })
        }),

        verifyOtp: builder.mutation({
            query: (cred: {email: string, otp: string}) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: cred
            }),

            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (error) {}
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
            })
        })
    })
});

export const {
    useCheckAuthQuery,
    useLoginMutation,
    useRegisterUserMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useLogoutMutation
} = authApi;
