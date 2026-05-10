import { apiSlice } from "@/app/apiSlice";

export interface PurchaseOrderItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  orderedQty: number;
  receivedQty: number;
  _id: string;
}

export interface PurchaseOrder {
  _id: string;
  supplierName: string;
  status: "PENDING" | "PARTIAL" | "COMPLETED";
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GetAllPOResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: PurchaseOrder[];
}

export interface GetAllPOParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreatePOPayload {
  supplierName: string;
  items: { productId: string; orderedQty: number }[];
}

export interface ReceiveGoodsPayload {
  purchaseOrderId: string;
  items: { productId: string; receivedQty: number }[];
  note?: string;
}

export interface GrnItem {
  _id: string;
  purchaseOrderId: string;
  items: { productId: { _id: string; name: string; images: string[] }; receivedQty: number }[];
  note?: string;
  createdAt: string;
}

export const purchaseOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPurchaseOrders: builder.query<GetAllPOResponse, GetAllPOParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.status) queryParams.set("status", params.status);
        return `/purchase-orders/getAll?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((po) => ({ type: "PurchaseOrder" as const, id: po._id })),
              { type: "PurchaseOrder", id: "LIST" },
            ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    getPurchaseOrderById: builder.query<{ data: PurchaseOrder }, string>({
      query: (id) => `/purchase-orders/getById/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PurchaseOrder", id }],
    }),

    createPurchaseOrder: builder.mutation<{ message: string; data: PurchaseOrder }, CreatePOPayload>({
      query: (body) => ({
        url: "/purchase-orders/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    receiveGoods: builder.mutation<{ message: string; data: { grn: GrnItem; poStatus: string } }, ReceiveGoodsPayload>({
      query: (body) => ({
        url: "/purchase-orders/receiveGoods",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "PurchaseOrder", id: arg.purchaseOrderId },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "Inventory", id: "LIST" },
      ],
    }),

    getGrnsByPurchaseOrder: builder.query<{ data: GrnItem[] }, string>({
      query: (purchaseOrderId) => `/purchase-orders/grn/${purchaseOrderId}`,
    }),
  }),
});

export const {
  useGetAllPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useReceiveGoodsMutation,
  useGetGrnsByPurchaseOrderQuery,
} = purchaseOrderApi;
