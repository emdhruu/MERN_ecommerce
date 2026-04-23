import { apiSlice } from "@/app/apiSlice";
//check
import { setAuthenticatedUser, setPendingUser, setAuthCheckComplete } from "./authSlice";

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
                    console.log("Auth check failed:", error);
                    // Don't do anything on error - let the interceptor handle token refresh
                    // If refresh also fails, it will logout automatically
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
                        console.log(errData?.user, "in error coming");
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
                    console.log("at registeration data", data);
                    dispatch(setPendingUser(data));
                    
                } catch (error: any) {
                    const errData = error?.error?.data;
                    console.log("err in register", errData);
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
                    console.log("data from verify otp", data);
                    dispatch(setAuthenticatedUser(data));
                } catch (error) {
                    console.log("error in verfiy otp", error);
                    
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
            })
        }),

        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST'
            }),
            //check
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAuthenticatedUser(data));
                } catch (error) {
                    console.log("Refresh failed:", error);
                    // If refresh fails, user is not authenticated
                    dispatch(setAuthCheckComplete());
                }
            }
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
