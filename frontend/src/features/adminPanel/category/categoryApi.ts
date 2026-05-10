import { apiSlice } from "@/app/apiSlice";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<{ data: Category[] }, void>({
      query: () => "/categories/getAll",
    }),

    createCategory: builder.mutation<{ message: string; data: Category }, CreateCategoryPayload>({
      query: (body) => ({
        url: "/categories/create",
        method: "POST",
        body,
      }),
    }),

    updateCategory: builder.mutation<{ message: string; data: Category }, UpdateCategoryPayload>({
      query: (body) => ({
        url: "/categories/update",
        method: "PUT",
        body,
      }),
    }),

    deleteCategory: builder.mutation<{ message: string }, { id: string }>({
      query: (body) => ({
        url: "/categories/delete",
        method: "DELETE",
        body,
      }),
    }),

    toggleCategoryActive: builder.mutation<{ message: string; data: Category }, { id: string; isActive: boolean }>({
      query: (body) => ({
        url: "/categories/isActiveUpdate",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} = categoryApi;
