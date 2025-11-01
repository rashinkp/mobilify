import { apiSlice } from "./apiSlices";

const USERS_URL = "/api/user";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAddress: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/address`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),
    getAddress: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        // Handle both object params (with limit) and primitive values (for backward compatibility)
        if (params && typeof params === 'object' && params.limit) {
          queryParams.append('limit', params.limit);
        }
        const queryString = queryParams.toString();
        return {
          url: `${USERS_URL}/address${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["Address"],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `${USERS_URL}/address/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),
    updateAddress: builder.mutation({
      query: ({ addressId, data }) => ({
        url: `${USERS_URL}/address`,
        method: "PUT",
        body: { data, addressId },
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useAddAddressMutation,
  useGetAddressQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} = usersApiSlice;
