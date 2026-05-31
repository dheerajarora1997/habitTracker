import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['User', 'Group', 'Record', 'AdminStats'],
  endpoints: (builder) => ({
    // Auth Endpoints
    requestOtp: builder.mutation<{ success: boolean; message: string; otp?: string }, { phoneNumber: string }>({
      query: (credentials) => ({
        url: '/auth/request-otp',
        method: 'POST',
        body: credentials,
      }),
    }),
    verifyOtp: builder.mutation<{ success: boolean; user: any }, { phoneNumber: string; otp: string; name?: string }>({
      query: (credentials) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Group'],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Group', 'Record', 'AdminStats'],
    }),
    checkMe: builder.query<{ success: boolean; user: any }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // User Profile
    updateProfile: builder.mutation<{ success: boolean; user: any }, { name: string; avatarUrl?: string }>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User', 'Group'],
    }),

    // Group Management
    createGroup: builder.mutation<{ success: boolean; group: any }, { groupName: string }>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group', 'User'],
    }),
    joinGroup: builder.mutation<{ success: boolean; group: any }, { inviteCode: string }>({
      query: (body) => ({
        url: '/groups/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group', 'User'],
    }),
    getGroups: builder.query<{ success: boolean; groups: any[] }, void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),
    getGroupDetails: builder.query<{ success: boolean; group: any; members: any[]; meUserId: string }, string>({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),

    // Daily Habit Records
    getTodayRecord: builder.query<{ success: boolean; record: any }, void>({
      query: () => '/records/today',
      providesTags: ['Record'],
    }),
    upsertRecord: builder.mutation<{ success: boolean; record: any; streak: number }, { steps: number; habits: any; notes?: string; date: string }>({
      query: (body) => ({
        url: '/records',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Record', 'Group'],
    }),
    getHistoryRecords: builder.query<{ success: boolean; records: any[] }, void>({
      query: () => '/records/history',
      providesTags: ['Record'],
    }),

    // Admin Endpoints
    getAdminStats: builder.query<{ success: boolean; stats: any }, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getAdminUsers: builder.query<{ success: boolean; users: any[] }, void>({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getAdminGroups: builder.query<{ success: boolean; groups: any[] }, void>({
      query: () => '/admin/groups',
      providesTags: ['Group'],
    }),
    banUser: builder.mutation<{ success: boolean; message: string; user: any }, { userId: string; isBanned: boolean }>({
      query: ({ userId, isBanned }) => ({
        url: `/admin/users/${userId}/ban`,
        method: 'PUT',
        body: { isBanned },
      }),
      invalidatesTags: ['User', 'AdminStats', 'Group'],
    }),
    deleteGroup: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Group', 'User', 'AdminStats'],
    }),
  }),
});

export const {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useLazyCheckMeQuery,
  useCheckMeQuery,
  useUpdateProfileMutation,
  useCreateGroupMutation,
  useJoinGroupMutation,
  useGetGroupsQuery,
  useGetGroupDetailsQuery,
  useGetTodayRecordQuery,
  useUpsertRecordMutation,
  useGetHistoryRecordsQuery,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminGroupsQuery,
  useBanUserMutation,
  useDeleteGroupMutation,
} = apiSlice;
