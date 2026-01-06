import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetPostsQuery } from '../features/api/apiSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '../components/community/PostCard';

const HomePage = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const [page, setPage] = useState(1);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const { data: postsData, isLoading, isError } = useGetPostsQuery({
        search: searchQuery,
        page: page
    });

    const posts = postsData?.results;

    if (isLoading) return <div className="text-center py-10">Loading posts...</div>;
    if (isError) return <div className="text-center py-10 text-red-500">Failed to load posts</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Top Posts'}
                </h1>
            </div>

            <div className="space-y-4">
                {posts?.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
                {posts?.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        {searchQuery ? `No results found for "${searchQuery}"` : 'No posts yet.'}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {postsData && (postsData.next || postsData.previous) && (
                <div className="flex justify-center space-x-4 mt-8 pb-8">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={!postsData.previous}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={!postsData.next}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="h-5 w-5 ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;
