import { apiSlice } from "@/app/apiSlice";

export interface Tax {
  _id: string;
  name: string;
  rate: number;
  applicableTo: "all" | "selective";
  applicableProducts: { _id: string; name: string }[];
  applicableCategories: { _id: string; name: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxPayload {
  name: string;
  rate: number;
  applicableTo: "all" | "selective";
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive?: boolean;
}

export interface Charge {
  _id: string;
  name: string;
  type: "fixed" | "percentage";
  amount: number;
  applicableTo: "all" | "selective";
  applicableProducts: { _id: string; name: string }[];
  applicableCategories: { _id: string; name: string }[];
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  maxAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChargePayload {
  name: string;
  type: "fixed" | "percentage";
  amount: number;
  applicableTo: "all" | "selective";
  applicableProducts?: string[];
  applicableCategories?: string[];
  minOrderAmount?: number | null;
  maxOrderAmount?: number | null;
  maxAmount?: number;
  isActive?: boolean;
}

export const configurationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTaxes: builder.query<{ data: Tax[] }, void>({
      query: () => "/tax/all",
    }),

    createTax: builder.mutation<{ data: Tax }, CreateTaxPayload>({
      query: (body) => ({
        url: "/tax/create",
        method: "POST",
        body,
      }),
    }),

    updateTax: builder.mutation<{ message: string; data: Tax }, Partial<CreateTaxPayload> & { _id: string }>({
      query: (body) => ({
        url: "/tax/update",
        method: "PUT",
        body,
      }),
    }),

    toggleTaxStatus: builder.mutation<{ data: Tax }, string>({
      query: (id) => ({
        url: "/tax/toggle-status",
        method: "POST",
        body: { _id: id },
      }),
    }),

    deleteTax: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: "/tax/delete",
        method: "DELETE",
        body: { _id: id },
      }),
    }),

    getAllCharges: builder.query<{ data: Charge[] }, void>({
      query: () => "/charges/all",
    }),

    createCharge: builder.mutation<{ data: Charge }, CreateChargePayload>({
      query: (body) => ({
        url: "/charges/create",
        method: "POST",
        body,
      }),
    }),

    updateCharge: builder.mutation<{ message: string; data: Charge }, Partial<CreateChargePayload> & { _id: string }>({
      query: (body) => ({
        url: "/charges/update",
        method: "PUT",
        body,
      }),
    }),

    toggleChargeStatus: builder.mutation<{ data: Charge }, string>({
      query: (id) => ({
        url: "/charges/toggle-status",
        method: "POST",
        body: { _id: id },
      }),
    }),

    deleteCharge: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: "/charges/delete",
        method: "DELETE",
        body: { _id: id },
      }),
    }),
  }),
});

export const {
  useGetAllTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useToggleTaxStatusMutation,
  useDeleteTaxMutation,
  useGetAllChargesQuery,
  useCreateChargeMutation,
  useUpdateChargeMutation,
  useToggleChargeStatusMutation,
  useDeleteChargeMutation,
} = configurationApi;
