import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setAuthenticatedUser } from "@/features/auth/authSlice";
import type { RootState } from "@/app/store";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: boolean) => void;
}> = [];

const processQueue = (success: boolean) => {
  failedQueue.forEach((prom) => {
    prom.resolve(success);
  });
  failedQueue = [];
};

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    }
}); 

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {

  const isRefreshCall =
    typeof args === "string"
      ? args.includes("/auth/refresh")
      : args.url?.includes("/auth/refresh");

  let result = await baseQuery(args, api, extraOptions);

  if ((result?.error?.status === 401 || result?.error?.status === 403) && !isRefreshCall) {

    if (isRefreshing) {
      const success = await new Promise<boolean>((resolve) => {
        failedQueue.push({ resolve });
      });

      if (success) {
        return await baseQuery(args, api, extraOptions);
      }
      return result;
    }

    isRefreshing = true;

    try {
      const refreshResult: any = await baseQuery(
        '/auth/refresh',
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        api.dispatch(
          setAuthenticatedUser({
            accessToken: refreshResult.data.accessToken,
            user: refreshResult.data.user,
          })
        );

        processQueue(true);
        return await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        processQueue(false);
        return result;
      }
    } catch (err) {
      api.dispatch(logout());
      processQueue(false);
      return result;
    } finally {
      isRefreshing = false;
    }
  }

  return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["PurchaseOrder", "Inventory", "Cart"],
    endpoints: () => ({})
})
