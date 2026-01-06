import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostsQuery, useVotePostMutation } from '../features/api/apiSlice';
import { MessageSquare, ArrowBigUp, ArrowBigDown, ExternalLink, Share2, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils';

const CategoryPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(1);

    // Reset page when category changes
    useEffect(() => {
        setPage(1);
    }, [slug]);

    const { data: postsData, isLoading, isError } = useGetPostsQuery({ category: slug, page });
    const posts = postsData?.results;

    const [votePost] = useVotePostMutation();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleVote = async (id, value) => {
        try {
            await votePost({ id, value }).unwrap();
        } catch (err) {
            console.error('Failed to vote:', err);
        }
    };

    const handleShare = (post) => {
        const url = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(url);
        addToast('Link copied to clipboard!', 'success');
    };

    const handleSave = () => {
        addToast('Post saved successfully!', 'success');
    };

    const handleComment = (postId) => {
        navigate(`/post/${postId}`);
    };

    if (isLoading) return <div className="text-center py-10">Loading posts...</div>;
    if (isError) return <div className="text-center py-10 text-red-500">Failed to load posts</div>;

    const formatCategoryName = (slug) => {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    #{formatCategoryName(slug)}
                </h1>
            </div>

            <div className="space-y-4">
                {posts?.map((post) => (
                    <div
                        key={post.id}
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="bg-white rounded border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group"
                    >
                        <div className="flex">
                            {/* Vote Column */}
                            <div className="w-10 bg-gray-50/50 flex flex-col items-center py-2 space-y-1 rounded-l text-gray-500">
                                <button onClick={(e) => { e.stopPropagation(); handleVote(post.id, 1) }} className="hover:text-orange-500 hover:bg-gray-200 p-1 rounded transition-colors">
                                    <ArrowBigUp className="w-6 h-6" />
                                </button>
                                <span className="text-xs font-bold">{post.vote_count}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleVote(post.id, -1) }} className="hover:text-blue-500 hover:bg-gray-200 p-1 rounded transition-colors">
                                    <ArrowBigDown className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content Column */}
                            <div className="p-2 pt-2 pr-4 flex-1">
                                {/* Metadata */}
                                <div className="flex items-center text-xs text-gray-500 mb-2 space-x-1">
                                    <span className="font-bold text-gray-700">u/{post.author.username}</span>
                                    <span>•</span>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    <span className="text-gray-400">• in {post.category_detail?.name || formatCategoryName(slug)}</span>
                                </div>

                                {/* Title */}
                                <h2 className="text-lg font-medium text-gray-900 mb-3 leading-snug">
                                    {post.title}
                                </h2>

                                {/* Post Body/Media */}
                                <div className="mb-2">
                                    {post.content && <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>}

                                    {(post.images?.length > 0 || post.image) && (
                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-black flex justify-center max-h-[512px]">
                                            <img
                                                src={getMediaUrl(post.images?.length > 0 ? post.images[0].image : post.image)}
                                                alt={post.title}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                            {post.images?.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    +{post.images.length - 1} more
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {post.video && (
                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-black max-h-[512px]">
                                            <video controls className="w-full h-full max-h-[512px]">
                                                <source src={getMediaUrl(post.video)} />
                                            </video>
                                        </div>
                                    )}

                                    {post.link_url && (
                                        <a
                                            href={post.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center text-blue-600 text-sm truncate">
                                                <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate group-link-hover:underline">{post.link_url}</span>
                                            </div>
                                        </a>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 text-gray-500 text-xs font-bold pt-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleComment(post.id); }}
                                        className="flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span>{post.comment_count} Comments</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                                        className="flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1 transition-colors"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span>Share</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSave(); }}
                                        className="flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1 transition-colors"
                                    >
                                        <Bookmark className="w-5 h-5" />
                                        <span>Save</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {posts?.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No posts in this category yet.
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

export default CategoryPage;
