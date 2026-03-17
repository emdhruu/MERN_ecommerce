import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "@/features/auth/authSlice";
import type { RootState } from "@/app/store";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token =  (getState() as RootState).auth.savedToken;
        if(token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
}); 

const baseQueryWithReauth : BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    console.log(result);
    
    if (result?.error?.status === 403) {
        const refreshResult: any = await baseQuery('/auth/refresh', api, extraOptions);
        console.log(refreshResult);
        if (refreshResult?.data) {
            const user = (api.getState() as RootState).auth.loggedInUser;
            //storing the new token
            api.dispatch(setCredentials({ ...refreshResult.data, user }));
            //retrying the original query with new access token
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }
    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
})