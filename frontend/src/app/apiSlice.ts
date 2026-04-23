import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setAuthenticatedUser } from "@/features/auth/authSlice";
import type { RootState } from "@/app/store";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token =  (getState() as RootState).auth.accessToken;
        if(token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
}); 

const baseQueryWithReauth : BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    console.log(result);

    const isRefreshCall = typeof args === "string" ? args.includes("/auth/refresh") : args.url.includes("/auth/refresh");
    console.log(isRefreshCall);
    
    if (result?.error?.status === 401 && !isRefreshCall) {

        const refreshResult: any = await baseQuery('/auth/refresh', api, extraOptions);
        console.log(refreshResult);

        if (refreshResult?.data) {
            const user = (api.getState() as RootState).auth.user;
            console.log(user);
            console.log(refreshResult.data);
            
            
            //storing the new token
            api.dispatch(setAuthenticatedUser(refreshResult.data));
            //retrying the original query with new access token
            result = await baseQuery(args, api, extraOptions);
        } else {
            console.log("logout is called here ");
            
            api.dispatch(logout());
        }
    }
    return result;
}

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
})