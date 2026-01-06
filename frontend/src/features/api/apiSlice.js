import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Post', 'User', 'Category', 'Comment'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'users/login/',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: 'users/register/',
                method: 'POST',
                body: userData,
            }),
        }),
        getUserProfile: builder.query({
            query: () => 'users/profile/',
        }),
        // Community Endpoints
        getCategories: builder.query({
            query: () => 'community/categories/',
            providesTags: ['Category'],
        }),
        getPosts: builder.query({
            query: (arg) => {
                let params = new URLSearchParams();
                if (arg?.category) params.append('category', arg.category);
                if (arg?.search) params.append('search', arg.search);
                if (arg?.page) params.append('page', arg.page);
                return `community/posts/?${params.toString()}`;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'Post', id })),
                        { type: 'Post', id: 'LIST' },
                    ]
                    : [{ type: 'Post', id: 'LIST' }],
        }),
        getUserPosts: builder.query({
            query: (userId) => `community/posts/?author=${userId}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ id }) => ({ type: 'Post', id })),
                        { type: 'Post', id: 'USER_LIST' },
                    ]
                    : [{ type: 'Post', id: 'USER_LIST' }],
        }),
        getPost: builder.query({
            query: (id) => `community/posts/${id}/`,
            providesTags: (result, error, id) => [{ type: 'Post', id }],
        }),
        createPost: builder.mutation({
            query: (postData) => ({
                url: 'community/posts/',
                method: 'POST',
                body: postData,
            }),
            invalidatesTags: [{ type: 'Post', id: 'LIST' }, { type: 'Post', id: 'USER_LIST' }],
        }),
        updatePost: builder.mutation({
            query: ({ id, data }) => ({
                url: `community/posts/${id}/`,
                method: 'PUT', // or PATCH
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
        }),
        deletePost: builder.mutation({
            query: (id) => ({
                url: `community/posts/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Post', id }, { type: 'Post', id: 'LIST' }, { type: 'Post', id: 'USER_LIST' }],
        }),
        votePost: builder.mutation({
            query: ({ id, value }) => ({
                url: `community/posts/${id}/vote/`,
                method: 'POST',
                body: { value },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
            async onQueryStarted({ id, value }, { dispatch, queryFulfilled, getState }) {
                const patchResults = [];
                const state = getState();
                const userId = state.auth?.user?.id;

                const updateDraft = (draftPost) => {
                    const previousVote = draftPost.user_vote || 0;
                    if (previousVote === value) {
                        // Toggle off
                        draftPost.user_vote = 0;
                        draftPost.vote_count -= (value === 1 ? 1 : -1);
                    } else {
                        // Change vote
                        draftPost.user_vote = value;
                        if (previousVote === 0) {
                            draftPost.vote_count += (value === 1 ? 1 : -1);
                        } else {
                            // Switching from -1 to 1 or 1 to -1 means change of 2
                            draftPost.vote_count += (value === 1 ? 2 : -2);
                        }
                    }
                };

                // 1. Update single post view
                patchResults.push(dispatch(
                    apiSlice.util.updateQueryData('getPost', id, (draft) => {
                        updateDraft(draft);
                    })
                ));

                // 2. Update list view (Main Feed)
                const commonArgs = [undefined, {}, { page: 1 }];
                commonArgs.forEach(arg => {
                    patchResults.push(dispatch(
                        apiSlice.util.updateQueryData('getPosts', arg, (draft) => {
                            const post = draft.results?.find(p => p.id === id);
                            if (post) {
                                updateDraft(post);
                            }
                        })
                    ));
                });

                // 3. User Posts
                if (userId) {
                    patchResults.push(dispatch(
                        apiSlice.util.updateQueryData('getUserPosts', userId, (draft) => {
                            const post = draft.results?.find(p => p.id === id);
                            if (post) {
                                updateDraft(post);
                            }
                        })
                    ));
                }

                // 4. Saved Posts
                patchResults.push(dispatch(
                    apiSlice.util.updateQueryData('getSavedPosts', undefined, (draft) => {
                        const savedItem = draft.results?.find(item => item.post.id === id);
                        if (savedItem) {
                            updateDraft(savedItem.post);
                        }
                    })
                ));

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach(patch => patch.undo());
                }
            },
        }),
        getComments: builder.query({
            query: (postId) => `community/comments/?post=${postId}`,
            providesTags: ['Comment'],
        }),
        getUserComments: builder.query({
            query: (userId) => `community/comments/?author=${userId}`,
            providesTags: ['Comment'],
        }),
        voteComment: builder.mutation({
            query: ({ id, value }) => ({
                url: `community/comments/${id}/vote/`,
                method: 'POST',
                body: { value },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Comment', id }],
            async onQueryStarted({ id, value, postId }, { dispatch, queryFulfilled }) {
                if (!postId) return; // Cannot update cache without postId
                const patchResult = dispatch(
                    apiSlice.util.updateQueryData('getComments', postId, (draft) => {
                        const comment = draft.find(c => c.id === id);
                        if (comment) {
                            const previousVote = comment.user_vote || 0;
                            if (previousVote === value) {
                                comment.user_vote = 0;
                                comment.vote_count -= (value === 1 ? 1 : -1);
                            } else {
                                comment.user_vote = value;
                                if (previousVote === 0) {
                                    comment.vote_count += (value === 1 ? 1 : -1);
                                } else {
                                    comment.vote_count += (value === 1 ? 2 : -2);
                                }
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        savePost: builder.mutation({
            query: (id) => ({
                url: `community/posts/${id}/save_post/`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Post', id }, 'SavedPost'],
        }),
        getSavedPosts: builder.query({
            query: () => 'community/posts/saved/',
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map(({ post }) => ({ type: 'Post', id: post.id })),
                        'SavedPost',
                    ]
                    : ['SavedPost'],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: 'community/categories/',
                method: 'POST',
                body: data, // Must contain name, description, etc.
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `community/categories/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        createComment: builder.mutation({
            query: (commentData) => ({
                url: 'community/comments/',
                method: 'POST',
                body: commentData,
            }),
            invalidatesTags: ['Comment', 'Post'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetUserProfileQuery,
    useGetCategoriesQuery,
    useGetPostsQuery,
    useGetUserPostsQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useVotePostMutation,
    useGetCommentsQuery,
    useGetUserCommentsQuery,
    useCreateCommentMutation,
    useVoteCommentMutation,
    useSavePostMutation,
    useGetSavedPostsQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useDeletePostImageMutation,
} = apiSlice;
