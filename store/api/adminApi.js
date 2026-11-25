import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminOverview: builder.query({
            query: (range = '30d') => `/admin/dashboard/overview?range=${range}`,
            providesTags: ['AdminOverview'],
        }),
    }),
});

export const { useGetAdminOverviewQuery } = adminApi;
