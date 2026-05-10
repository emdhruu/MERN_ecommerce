import { apiSlice } from "@/app/apiSlice";

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: "SALES" | "PURCHASE";
  orderId?: any;
  purchaseOrderId?: any;
  customer?: { name: string; email: string };
  supplier?: { name: string };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  totalAmount: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  notes?: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllInvoicesResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Invoice[];
}

export interface GetAllInvoicesParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllInvoices: builder.query<GetAllInvoicesResponse, GetAllInvoicesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.type) queryParams.set("type", params.type);
        if (params.status) queryParams.set("status", params.status);
        return `/invoices/getAll?${queryParams.toString()}`;
      },
    }),

    getInvoiceById: builder.query<{ data: Invoice }, string>({
      query: (id) => `/invoices/getById/${id}`,
    }),

    createSalesInvoice: builder.mutation<{ message: string; data: Invoice }, { orderId: string; taxRate?: number; discount?: number; notes?: string }>({
      query: (body) => ({
        url: "/invoices/sales",
        method: "POST",
        body,
      }),
    }),

    createPurchaseInvoice: builder.mutation<{ message: string; data: Invoice }, { purchaseOrderId: string; taxRate?: number; notes?: string }>({
      query: (body) => ({
        url: "/invoices/purchase",
        method: "POST",
        body,
      }),
    }),

    updateInvoiceStatus: builder.mutation<{ message: string; data: Invoice }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/invoices/updateStatus/${id}`,
        method: "PUT",
        body: { status },
      }),
    }),
  }),
});

export const {
  useGetAllInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateSalesInvoiceMutation,
  useCreatePurchaseInvoiceMutation,
  useUpdateInvoiceStatusMutation,
} = invoiceApi;
