import { apiSlice } from "@/app/apiSlice";

export interface LedgerEntry {
  _id: string;
  productId: {
    _id: string;
    name: string;
  };
  type: "IN" | "OUT" | "RESERVE" | "RELEASE" | "ADJUST";
  quantity: number;
  reference: "ORDER" | "PURCHASE" | "SYSTEM" | "ADMIN";
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface GetLedgerResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: LedgerEntry[];
}

export interface GetLedgerParams {
  page?: number;
  limit?: number;
  type?: string;
  reference?: string;
  productId?: string;
}

export const ledgerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllLedgerEntries: builder.query<GetLedgerResponse, GetLedgerParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.type) queryParams.set("type", params.type);
        if (params.reference) queryParams.set("reference", params.reference);
        if (params.productId) queryParams.set("productId", params.productId);
        return `/inventory-ledger/getAll?${queryParams.toString()}`;
      },
    }),

    getLedgerByProduct: builder.query<GetLedgerResponse, { productId: string; page?: number; limit?: number; type?: string }>({
      query: ({ productId, page, limit, type }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.set("page", page.toString());
        if (limit) queryParams.set("limit", limit.toString());
        if (type) queryParams.set("type", type);
        return `/inventory-ledger/getByProduct/${productId}?${queryParams.toString()}`;
      },
    }),
  }),
});

export const {
  useGetAllLedgerEntriesQuery,
  useGetLedgerByProductQuery,
  useLazyGetLedgerByProductQuery,
} = ledgerApi;
