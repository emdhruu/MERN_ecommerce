import { apiSlice } from "@/app/apiSlice";

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    thumbnail?: string;
    price: { $numberDecimal: string } | number;
    salesPrice?: { $numberDecimal: string } | number | null;
  };
  quantity: number;
  price: { $numberDecimal: string } | number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  address: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed";
  transactionId?: string;
  totalAmount: { $numberDecimal: string } | number;
  orderStatus: "PENDING" | "PAYMENT_PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED" | "DELIVERED";
  createdAt: string;
  updatedAt: string;
}

export interface GetAllOrdersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Order[];
}

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query<GetAllOrdersResponse, GetAllOrdersParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.status) queryParams.set("status", params.status);
        if (params.paymentStatus) queryParams.set("paymentStatus", params.paymentStatus);
        return `/order/getAll?${queryParams.toString()}`;
      },
    }),

    getOrderById: builder.query<{ data: Order }, string>({
      query: (orderId) => `/order/getById/${orderId}`,
    }),

    confirmPayment: builder.mutation<{ message: string; data: Order }, { orderId: string; transactionId?: string }>({
      query: ({ orderId, ...body }) => ({
        url: `/order/confirmPayment/${orderId}`,
        method: "PUT",
        body,
      }),
    }),

    cancelOrder: builder.mutation<{ message: string; data: Order }, { orderId: string; reason?: string }>({
      query: ({ orderId, ...body }) => ({
        url: `/order/cancel/${orderId}`,
        method: "PUT",
        body,
      }),
    }),

    markDelivered: builder.mutation<{ message: string; data: Order }, string>({
      query: (orderId) => ({
        url: `/order/markDelivered/${orderId}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useConfirmPaymentMutation,
  useCancelOrderMutation,
  useMarkDeliveredMutation,
} = ordersApi;
