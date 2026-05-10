import { apiSlice } from "@/app/apiSlice";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<{ data: User[] }, void>({
      query: () => "/user/usersList",
    }),

    getUserById: builder.query<{ data: User }, string>({
      query: (id) => `/user/getUser/${id}`,
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/user/deleteUser/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
} = usersApi;
