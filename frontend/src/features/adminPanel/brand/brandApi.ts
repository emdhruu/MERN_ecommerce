import { apiSlice } from "@/app/apiSlice";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandPayload {
  name: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateBrandPayload {
  id: string;
  name?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export const brandApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBrands: builder.query<{ data: Brand[] }, void>({
      query: () => "/brand/all",
    }),

    getBrandBySlug: builder.query<Brand, string>({
      query: (slug) => `/brand/${slug}`,
    }),

    createBrand: builder.mutation<{ message: string }, CreateBrandPayload>({
      query: (body) => ({
        url: "/brand/create",
        method: "POST",
        body,
      }),
    }),

    updateBrand: builder.mutation<{ message: string }, UpdateBrandPayload>({
      query: ({ id, ...body }) => ({
        url: `/brand/update/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteBrand: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/brand/delete/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useGetBrandBySlugQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
