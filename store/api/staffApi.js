import { baseApi } from './baseApi';

export const staffApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStaffList: builder.query({
            query: ({ search = '', role = 'All', department = 'All', status = 'All', sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = {}) =>
                `/admin/staff?search=${encodeURIComponent(search)}&role=${role}&department=${department}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=${limit}`,
            providesTags: ['StaffList'],
        }),
        getStaffStatistics: builder.query({
            query: () => '/admin/staff/statistics',
            providesTags: ['StaffStats'],
        }),
        getStaffDetail: builder.query({
            query: (id) => `/admin/staff/${id}`,
            providesTags: (result, error, id) => [{ type: 'StaffDetail', id }],
        }),
        getStaffActivity: builder.query({
            query: (id) => `/admin/staff/${id}/activity`,
            providesTags: (result, error, id) => [{ type: 'StaffActivity', id }],
        }),
        createStaff: builder.mutation({
            query: (body) => ({
                url: '/admin/staff',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['StaffList', 'StaffStats', 'AuditLogs'],
        }),
        updateStaff: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/admin/staff/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, error, { id }) => ['StaffList', 'StaffStats', { type: 'StaffDetail', id }, { type: 'StaffActivity', id }],
        }),
        updateStaffStatus: builder.mutation({
            query: ({ id, status, reason }) => ({
                url: `/admin/staff/${id}/status`,
                method: 'PATCH',
                body: { status, reason },
            }),
            invalidatesTags: (result, error, { id }) => ['StaffList', 'StaffStats', { type: 'StaffDetail', id }, { type: 'StaffActivity', id }],
        }),
        resetStaffPassword: builder.mutation({
            query: ({ id, newPassword }) => ({
                url: `/admin/staff/${id}/reset-password`,
                method: 'POST',
                body: { newPassword },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'StaffDetail', id }, { type: 'StaffActivity', id }],
        }),
    }),
});

export const {
    useGetStaffListQuery,
    useGetStaffStatisticsQuery,
    useGetStaffDetailQuery,
    useGetStaffActivityQuery,
    useCreateStaffMutation,
    useUpdateStaffMutation,
    useUpdateStaffStatusMutation,
    useResetStaffPasswordMutation,
} = staffApi;
