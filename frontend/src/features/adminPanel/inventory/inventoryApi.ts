import { apiSlice } from "@/app/apiSlice";

export interface InventoryItem {
  _id: string;
  productId: string;
  availableStock: number;
  reservedStock: number;
  totalStock: number;
  lowStockThreshold: number;
  product: {
    _id: string;
    name: string;
    images: string[];
    thumbnail?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetAllInventoryResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: InventoryItem[];
}

export interface GetAllInventoryParams {
  page?: number;
  limit?: number;
  lowStock?: boolean;
  search?: string;
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllInventory: builder.query<GetAllInventoryResponse, GetAllInventoryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.lowStock) queryParams.set("lowStock", "true");
        if (params.search) queryParams.set("search", params.search);
        return `/inventory/getAll?${queryParams.toString()}`;
      },
      providesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    getInventoryByProduct: builder.query<{ data: InventoryItem }, string>({
      query: (productId) => `/inventory/getByProduct/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: "Inventory", id: productId }],
    }),

    getLowStockAlerts: builder.query<{ data: InventoryItem[] }, void>({
      query: () => "/inventory/lowStock",
      providesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    reserveStock: builder.mutation<{ message: string; data: InventoryItem }, { productId: string; quantity: number; orderId: string }>({
      query: (body) => ({
        url: "/inventory/reserve",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    releaseStock: builder.mutation<{ message: string; data: InventoryItem }, { productId: string; quantity: number; orderId: string }>({
      query: (body) => ({
        url: "/inventory/release",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    consumeStock: builder.mutation<{ message: string; data: InventoryItem }, { productId: string; quantity: number; orderId: string }>({
      query: (body) => ({
        url: "/inventory/consume",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),

    adjustStock: builder.mutation<{ message: string }, { productId: string; quantity: number; note: string }>({
      query: (body) => ({
        url: "/inventory/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Inventory", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllInventoryQuery,
  useGetInventoryByProductQuery,
  useLazyGetInventoryByProductQuery,
  useGetLowStockAlertsQuery,
  useReserveStockMutation,
  useReleaseStockMutation,
  useConsumeStockMutation,
  useAdjustStockMutation,
} = inventoryApi;
