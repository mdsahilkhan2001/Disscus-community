
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetUserCommentsQuery, useGetUserPostsQuery, useDeletePostMutation, useGetSavedPostsQuery } from '../features/api/apiSlice';
import { User, Mail, Shield, MessageSquare, Clock, FileText, ThumbsUp, Calendar, Edit, Trash2, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils';

const DashboardPage = () => {
    const user = useSelector(selectCurrentUser);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { data: comments, isLoading: commentsLoading } = useGetUserCommentsQuery(user?.id, { skip: !user });
    const { data: postsData, isLoading: postsLoading } = useGetUserPostsQuery(user?.id, { skip: !user });
    const { data: savedData, isLoading: savedLoading } = useGetSavedPostsQuery(undefined, { skip: !user });
    const [deletePost] = useDeletePostMutation();
    const posts = postsData?.results || [];
    const savedPosts = savedData?.results || [];

    const [activeTab, setActiveTab] = useState(user?.role === 'STUDENT' ? 'comments' : 'posts');

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            try {
                await deletePost(id).unwrap();
                addToast("Post deleted successfully", "success");
            } catch (err) {
                console.error("Failed to delete post:", err);
                addToast("Failed to delete post", "error");
            }
        }
    };

    if (!user) return <div className="text-center py-10">Please log in to view your dashboard.</div>;

    // Calculate Stats
    const totalPosts = posts.length || 0;
    const totalComments = comments?.length || 0;
    const totalVotesReceived = posts.reduce((acc, post) => acc + (post.vote_count || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-md">
                        {user.username[0].toUpperCase()}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.username}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                            user.role === 'FACULTY' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-green-100 text-green-700'
                            } `}>
                            {user.role}
                        </span>
                        <span className="flex items-center text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                            <Mail className="w-4 h-4 mr-2" />
                            {user.email}
                        </span>
                    </div>
                    <p className="text-gray-500 max-w-lg mx-auto md:mx-0 pt-2 text-sm md:text-base">
                        Welcome to your dashboard. Here you can manage your posts, view your activity, and track your community engagement.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 w-full md:w-auto">
                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center border border-gray-100">
                        <div className="text-xl md:text-2xl font-bold text-indigo-600">{totalPosts}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold">Posts</div>
                    </div>
                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center border border-gray-100">
                        <div className="text-xl md:text-2xl font-bold text-purple-600">{totalComments}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold">Comments</div>
                    </div>
                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center border border-gray-100">
                        <div className="text-xl md:text-2xl font-bold text-orange-600">{totalVotesReceived}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold">Karma</div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200">
                    {user.role !== 'STUDENT' && (
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-4 text-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'posts'
                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                } `}
                        >
                            <div className="flex items-center justify-center">
                                <FileText className="w-4 h-4 mr-2" />
                                My Posts
                            </div>
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex - 1 py - 4 text - center font - medium text - sm transition - colors border - b - 2 ${activeTab === 'comments'
                            ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } `}
                    >
                        <div className="flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Recent Comments
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`flex-1 py-4 text-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'saved'
                            ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } `}
                    >
                        <div className="flex items-center justify-center">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Saved Posts
                        </div>
                    </button>
                </div>

                <div className="p-6">
                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                        <div className="space-y-4">
                            {postsLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading posts...</div>
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group">
                                        {/* Thumbnail (if any) */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4 border border-gray-300">
                                            {post.image || (post.images && post.images.length > 0) ? (
                                                <img
                                                    src={getMediaUrl(post.image || post.images[0].image)}
                                                    alt="thumb"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <Link to={`/post/${post.id}`} className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 truncate block">
                                                    {post.title}
                                                </Link>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                    {/* Actions */}
                                                    <div className="flex space-x-1 pl-2 border-l border-gray-200 ml-2">
                                                        <Link to={`/post/edit/${post.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {post.content || 'No text content'}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <ThumbsUp className="w-3 h-3 mr-1" /> {post.vote_count} Votes
                                                </span>
                                                <span className="flex items-center">
                                                    <MessageSquare className="w-3 h-3 mr-1" /> {post.comment_count} Comments
                                                </span>
                                                <span className="text-indigo-500 font-medium">
                                                    {post.category_detail?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                                    <p className="text-gray-500 mb-6">
                                        {user.role === 'STUDENT'
                                            ? 'You can engage with posts by voting and commenting.'
                                            : 'Share your first post with the community!'
                                        }
                                    </p>
                                    {user.role !== 'STUDENT' && (
                                        <Link to="/submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                            Create Post
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="space-y-4">
                            {commentsLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading comments...</div>
                            ) : comments?.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">
                                                    On <span className="font-semibold text-gray-700">Post #{comment.post}</span>
                                                    <span className="mx-2">•</span>
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </p>
                                                <div className="text-gray-900 bg-white p-3 rounded border border-gray-200 text-sm">
                                                    "{comment.content}"
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No comments yet</h3>
                                    <p className="text-gray-500">Join the discussion on posts!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved Posts Tab */}
                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            {savedLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading saved posts...</div>
                            ) : savedPosts.length > 0 ? (
                                savedPosts.map((item) => {
                                    const post = item.post;
                                    return (
                                        <div key={item.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group">
                                            {/* Thumbnail */}
                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4 border border-gray-300">
                                                {post.image || (post.images && post.images.length > 0) ? (
                                                    <img
                                                        src={getMediaUrl(post.image || post.images[0].image)}
                                                        alt="thumb"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <Link to={`/post/${post.id}`} className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 truncate block">
                                                        {post.title}
                                                    </Link>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                                            Saved on {new Date(item.created_at).toLocaleDateString()}
                                                        </span>
                                                        <Link to={`/post/${post.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="View">
                                                            <FileText className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                    {post.content || 'No text content'}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center">
                                                        <ThumbsUp className="w-3 h-3 mr-1" /> {post.vote_count} Votes
                                                    </span>
                                                    <span className="flex items-center">
                                                        <MessageSquare className="w-3 h-3 mr-1" /> {post.comment_count} Comments
                                                    </span>
                                                    <span className="text-indigo-500 font-medium">
                                                        {post.category_detail?.name}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        by {post.author.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No saved posts</h3>
                                    <p className="text-gray-500">Posts you save will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
