import { apiSlice } from "@/app/apiSlice";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: { $numberDecimal: string } | number;
  salesPrice?: { $numberDecimal: string } | number | null;
  discountPercentage: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  inStock: boolean;
  images: string[];
  thumbnail?: string;
  stock: number;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllProductsResponse {
  page: number;
  limit: number;
  data: Product[];
}

export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  salesPrice?: number | null;
  discountPercentage?: number;
  category: string;
  brand: string;
  inStock?: boolean;
  images: string[];
  thumbnail?: string;
  stock: number;
  isFeatured?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<GetAllProductsResponse, GetAllProductsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.search) queryParams.set("search", params.search);
        if (params.category) queryParams.set("category", params.category);
        if (params.brand) queryParams.set("brand", params.brand);
        if (params.sort) queryParams.set("sort", params.sort);
        if (params.order) queryParams.set("order", params.order);
        return `/product/getAll?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        return {
          ...response,
          totalCount: response.total || 0,
          totalPages: response.totalPages || 1,
        } as GetAllProductsResponse & { totalCount: number; totalPages: number };
      },
    }),

    getProductById: builder.query<{ data: Product }, string>({
      query: (id) => `/product/getById/${id}`,
    }),

    createProduct: builder.mutation<{ message: string; data: Product }, CreateProductPayload>({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
    }),

    updateProduct: builder.mutation<{ message: string; data: Product }, UpdateProductPayload>({
      query: ({ id, ...body }) => ({
        url: `/product/update/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/product/deleteById/${id}`,
        method: "DELETE",
      }),
    }),

    updateProductStock: builder.mutation<{ message: string; data: Product }, { id: string; stock: number }>({
      query: ({ id, stock }) => ({
        url: `/product/updateStock/${id}`,
        method: "PUT",
        body: { stock },
      }),
    }),

    updateFeaturedStatus: builder.mutation<{ message: string; data: Product }, { id: string; isFeatured: boolean }>({
      query: ({ id, isFeatured }) => ({
        url: `/product/updateFeaturedStatus/${id}`,
        method: "PUT",
        body: { isFeatured },
      }),
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStockMutation,
  useUpdateFeaturedStatusMutation,
} = productApi;
