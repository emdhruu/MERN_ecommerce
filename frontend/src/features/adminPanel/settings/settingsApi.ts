import { apiSlice } from "@/app/apiSlice";

export interface StoreSettings {
  _id: string;
  storeName: string;
  currency: string;
  currencySymbol: string;
  lowStockThreshold: number;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  _id: string;
  userId: string;
  lowStockAlerts: boolean;
  newOrders: boolean;
  paymentFailures: boolean;
  dailySummary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreSettingsPayload {
  storeName?: string;
  currency?: string;
  currencySymbol?: string;
  lowStockThreshold?: number;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateNotificationPrefsPayload {
  lowStockAlerts?: boolean;
  newOrders?: boolean;
  paymentFailures?: boolean;
  dailySummary?: boolean;
}

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query<{ data: StoreSettings }, void>({
      query: () => "/settings/store",
    }),

    updateStoreSettings: builder.mutation<{ message: string; data: StoreSettings }, UpdateStoreSettingsPayload>({
      query: (body) => ({
        url: "/settings/store",
        method: "PUT",
        body,
      }),
    }),

    getNotificationPreferences: builder.query<{ data: NotificationPreferences }, void>({
      query: () => "/settings/notifications",
    }),

    updateNotificationPreferences: builder.mutation<{ message: string; data: NotificationPreferences }, UpdateNotificationPrefsPayload>({
      query: (body) => ({
        url: "/settings/notifications",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = settingsApi;
