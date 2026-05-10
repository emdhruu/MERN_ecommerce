import { apiSlice } from "@/app/apiSlice";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  lowStockCount: number;
  totalProducts: number;
  pendingOrders: number;
  ordersByStatus: { _id: string; count: number }[];
}

export interface RevenueChartItem {
  _id: { year: number; month: number; day?: number };
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  totalSold: number;
  totalRevenue: number;
  product: {
    name: string;
    images: string[];
    thumbnail?: string;
    price: { $numberDecimal: string } | number;
  };
}

export interface SalesStats {
  today: { revenue: number; orders: number };
  thisWeek: { revenue: number; orders: number };
  thisMonth: { revenue: number; orders: number };
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<{ data: DashboardStats }, void>({
      query: () => "/admin/dashboard/stats",
    }),

    getRevenueChart: builder.query<{ data: RevenueChartItem[] }, { period?: string; days?: number }>({
      query: ({ period = "daily", days = 30 }) =>
        `/admin/dashboard/revenue?period=${period}&days=${days}`,
    }),

    getTopProducts: builder.query<{ data: TopProduct[] }, { limit?: number }>({
      query: ({ limit = 10 }) => `/admin/dashboard/topProducts?limit=${limit}`,
    }),

    getSalesStats: builder.query<{ data: SalesStats }, void>({
      query: () => "/admin/dashboard/salesStats",
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetTopProductsQuery,
  useGetSalesStatsQuery,
} = dashboardApi;
