import { apiSlice } from "@/app/apiSlice";

// ===== PRODUCT TYPES =====
export interface StoreProduct {
  _id: string;
  name: string;
  description: string;
  price: { $numberDecimal: string } | number;
  salesPrice?: { $numberDecimal: string } | number | null;
  discountPercentage: number;
  category: { _id: string; name: string; slug: string };
  brand: { _id: string; name: string; slug: string };
  inStock: boolean;
  images: string[];
  thumbnail?: string;
  stock: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface GetProductsResponse {
  page: number;
  limit: number;
  data: StoreProduct[];
}

// ===== CART TYPES =====
export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface CartResponse {
  cartItems: {
    _id: string;
    user: string;
    items: CartItem[];
  };
}

// ===== ADDRESS TYPES =====
export interface AddressItem {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  country: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

export interface AddressResponse {
  data: {
    _id: string;
    user: string;
    items: AddressItem[];
  };
}

// ===== ORDER TYPES =====
export interface UserOrder {
  _id: string;
  items: { product: { _id: string; name: string; thumbnail?: string }; quantity: number; price: { $numberDecimal: string } | number }[];
  subtotal: { $numberDecimal: string } | number;
  totalAmount: { $numberDecimal: string } | number;
  discount: { $numberDecimal: string } | number;
  couponCode: string | null;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

// ===== REVIEW TYPES =====
export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  rating: number;
  comment: string[];
  createdAt: string;
}

export const storeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Products (public)
    getStoreProducts: builder.query<GetProductsResponse & { totalCount: number; totalPages: number }, GetProductsParams>({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params.page) qp.set("page", params.page.toString());
        if (params.limit) qp.set("limit", params.limit.toString());
        if (params.search) qp.set("search", params.search);
        if (params.category) qp.set("category", params.category);
        if (params.brand) qp.set("brand", params.brand);
        if (params.sort) qp.set("sort", params.sort);
        if (params.order) qp.set("order", params.order);
        return `/product/getAll?${qp.toString()}`;
      },
      transformResponse: (response: any) => {
        return {
          ...response,
          totalCount: response.total || 0,
          totalPages: response.totalPages || 1,
        };
      },
    }),

    getFeaturedProducts: builder.query<{ data: StoreProduct[] }, void>({
      query: () => "/product/getFeatured",
    }),

    getStoreProductById: builder.query<{ data: StoreProduct }, string>({
      query: (id) => `/product/getById/${id}`,
    }),

    // Categories (public)
    getStoreCategories: builder.query<{ data: { _id: string; name: string; slug: string; isActive: boolean }[] }, void>({
      query: () => "/categories/getAll",
    }),

    // Brands (public)
    getStoreBrands: builder.query<{ data: { _id: string; name: string; slug: string }[] }, void>({
      query: () => "/brand/all",
    }),

    // Cart (auth required)
    getCart: builder.query<CartResponse, void>({
      query: () => "/cart/getCart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<{ message: string }, { productId: string; quantity?: number }>({
      query: (body) => ({
        url: "/cart/addToCart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartQuantity: builder.mutation<{ message: string }, { productId: string; quantity: number }>({
      query: (body) => ({
        url: "/cart/updateQuantity",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/cart/deleteCartItems",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Address (auth required)
    getUserAddresses: builder.query<AddressResponse, void>({
      query: () => "/address/getByUserId",
    }),

    addAddress: builder.mutation<{ message: string; data: any }, Omit<AddressItem, "_id">>({
      query: (body) => ({
        url: "/address/add",
        method: "POST",
        body,
      }),
    }),

    updateAddress: builder.mutation<{ message: string; data: any }, { addressId: string; updateData: Omit<AddressItem, "_id"> }>({
      query: (body) => ({
        url: "/address/updateById",
        method: "PUT",
        body,
      }),
    }),

    setDefaultAddress: builder.mutation<{ message: string }, { addressId: string }>({
      query: (body) => ({
        url: "/address/setDefaultById",
        method: "PUT",
        body,
      }),
    }),

    deleteAddress: builder.mutation<{ message: string }, { addressId: string }>({
      query: (body) => ({
        url: "/address/deleteById",
        method: "DELETE",
        body,
      }),
    }),

    // Orders (auth required)
    createOrder: builder.mutation<{ message: string; data: any }, { items: { product: string; quantity: number }[]; address: string; paymentMethod: string; couponCode?: string }>({
      query: (body) => ({
        url: "/order/create",
        method: "POST",
        body,
      }),
    }),

    getMyOrders: builder.query<{ page: number; limit: number; total: number; totalPages: number; data: UserOrder[] }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/order/myOrders?page=${page}&limit=${limit}`,
    }),

    // Reviews (public read, auth write)
    getProductReviews: builder.query<{ data: Review[] }, { productId: string; page?: number; limit?: number }>({
      query: ({ productId, page, limit }) => {
        const qp = new URLSearchParams();
        if (page) qp.set("page", page.toString());
        if (limit) qp.set("limit", limit.toString());
        return `/review/reviewsByProduct/${productId}?${qp.toString()}`;
      },
    }),

    addReview: builder.mutation<{ message: string }, { productId: string; rating: number; comment?: string }>({
      query: (body) => ({
        url: "/review/addRatingToReview",
        method: "POST",
        body,
      }),
    }),

    applyCoupon: builder.mutation<{
      data: {
        originalAmount: number;
        discountApplied: number;
        payableValue: number;
        couponDetails: any;
      }
    }, { code: string }>({
      query: (body) => ({
        url: "/coupon/apply-coupon",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetStoreProductsQuery,
  useGetFeaturedProductsQuery,
  useGetStoreProductByIdQuery,
  useGetStoreCategoriesQuery,
  useGetStoreBrandsQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useClearCartMutation,
  useGetUserAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useApplyCouponMutation,
} = storeApi;
