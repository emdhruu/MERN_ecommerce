import { apiSlice } from "@/app/apiSlice";

export interface Coupon {
  _id: string;
  code: string;
  type: "cart" | "category" | "product";
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
  minPurchaseAmount?: { $numberDecimal: string } | number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  userLimit?: number;
  usedBy: { userId: string; usedAt: string }[];
  applicableCategories?: string[];
  applicableProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  type: "cart" | "category" | "product";
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
  minPurchaseAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
  usageLimit?: number;
  userLimit?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCoupons: builder.query<{ data: Coupon[] }, void>({
      query: () => "/coupon/all",
    }),

    createCoupon: builder.mutation<{ data: Coupon }, CreateCouponPayload>({
      query: (body) => ({
        url: "/coupon/create",
        method: "POST",
        body,
      }),
    }),

    updateCoupon: builder.mutation<{ message: string; data: Coupon }, Partial<CreateCouponPayload> & { _id: string }>({
      query: (body) => ({
        url: "/coupon/updateCoupon",
        method: "PUT",
        body,
      }),
    }),

    toggleCouponStatus: builder.mutation<{ data: Coupon }, string>({
      query: (id) => ({
        url: "/coupon/toggle-status",
        method: "POST",
        body: { _id: id },
      }),
    }),

    deleteCoupon: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: "/coupon/deleteCoupon",
        method: "DELETE",
        body: { _id: id },
      }),
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useToggleCouponStatusMutation,
  useDeleteCouponMutation,
} = couponApi;
