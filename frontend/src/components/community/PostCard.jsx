import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVotePostMutation, useSavePostMutation } from '../../features/api/apiSlice';
import { useToast } from '../../context/ToastContext';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { getMediaUrl } from '../../utils';

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [votePost] = useVotePostMutation();
    const [savePost] = useSavePostMutation();
    const user = useSelector(selectCurrentUser);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleVote = async (id, value) => {
        if (!user) {
            addToast('Please login to vote', 'info');
            navigate('/login');
            return;
        }
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

    const handleSave = async () => {
        if (!user) {
            addToast('Please login to save posts', 'info');
            navigate('/login');
            return;
        }
        try {
            await savePost(post.id).unwrap();
            const action = post.is_saved ? 'unsaved' : 'saved';
            addToast(`Post ${action} successfully!`, 'success');
        } catch (err) {
            console.error('Failed to save post:', err);
            addToast('Failed to save post', 'error');
        }
    };

    const handleComment = (postId) => {
        if (!user) {
            addToast('Please login to comment', 'info');
            navigate('/login');
            return;
        }
        navigate(`/post/${postId}`);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (post.images && post.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (post.images && post.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
        }
    };

    // Determine which image to show
    let displayImage = null;
    if (post.images && post.images.length > 0) {
        displayImage = post.images[currentImageIndex].image;
    } else if (post.image) {
        displayImage = post.image;
    }

    const hasMultipleImages = post.images && post.images.length > 1;
    const imageUrl = getMediaUrl(displayImage);
    const videoUrl = getMediaUrl(post.video);

    return (
        <div
            onClick={() => navigate(`/post/${post.id}`)}
            className="bg-white rounded border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group"
        >
            <div className="flex">
                {/* Vote Column - Hidden on Mobile, Visible on Tablet/Desktop */}
                <div className="w-10 bg-gray-50/50 hidden sm:flex flex-col items-center py-2 space-y-1 rounded-l text-gray-500">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, 1) }}
                        className={`p-1 rounded transition-colors hover:bg-gray-200 ${post.user_vote === 1 ? 'text-orange-500' : 'hover:text-orange-500'}`}
                    >
                        <ArrowBigUp className={`w-6 h-6 ${post.user_vote === 1 ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`text-xs font-bold ${post.user_vote === 1 ? 'text-orange-500' : post.user_vote === -1 ? 'text-blue-500' : ''}`}>
                        {post.vote_count}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, -1) }}
                        className={`p-1 rounded transition-colors hover:bg-gray-200 ${post.user_vote === -1 ? 'text-blue-500' : 'hover:text-blue-500'}`}
                    >
                        <ArrowBigDown className={`w-6 h-6 ${post.user_vote === -1 ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Content Column */}
                <div className="p-3 sm:p-2 sm:pt-2 sm:pr-4 flex-1">
                    {/* Metadata */}
                    <div className="flex items-center text-xs text-gray-500 mb-2 space-x-1">
                        {post.category_detail && (
                            <>
                                <span className="font-bold text-gray-700 hover:underline">{post.category_detail.name}</span>
                                <span>•</span>
                            </>
                        )}
                        <span>Posted by</span>
                        <span className="hover:underline">u/{post.author.username}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-medium text-gray-900 mb-3 leading-snug">
                        {post.title}
                    </h2>

                    {/* Post Body/Media */}
                    <div className="mb-2">
                        {post.content && <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>}

                        {imageUrl && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-black flex justify-center items-center relative max-h-[512px]">
                                <img
                                    src={imageUrl}
                                    alt={post.title}
                                    className="max-h-full max-w-full object-contain"
                                />

                                {/* Carousel Controls */}
                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Image Counter Badge */}
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                            {currentImageIndex + 1}/{post.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {videoUrl && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-black max-h-[512px]">
                                <video controls className="w-full h-full max-h-[512px]">
                                    <source src={videoUrl} />
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
                    <div className="flex items-center space-x-2 text-gray-500 text-xs font-bold pt-1 overflow-x-auto">
                        {/* Mobile Vote Controls */}
                        <div className="flex sm:hidden items-center space-x-1 border-r border-gray-200 pr-3 mr-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleVote(post.id, 1) }}
                                className={`p-1 rounded transition-colors hover:bg-gray-200 ${post.user_vote === 1 ? 'text-orange-500' : 'hover:text-orange-500'}`}
                            >
                                <ArrowBigUp className={`w-6 h-6 ${post.user_vote === 1 ? 'fill-current' : ''}`} />
                            </button>
                            <span className={`text-sm ${post.user_vote === 1 ? 'text-orange-500' : post.user_vote === -1 ? 'text-blue-500' : ''}`}>
                                {post.vote_count}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleVote(post.id, -1) }}
                                className={`p-1 rounded transition-colors hover:bg-gray-200 ${post.user_vote === -1 ? 'text-blue-500' : 'hover:text-blue-500'}`}
                            >
                                <ArrowBigDown className={`w-6 h-6 ${post.user_vote === -1 ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleComment(post.id); }}
                            className="flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1 transition-colors whitespace-nowrap"
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
                            className={`flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1 transition-colors ${post.is_saved ? 'text-indigo-600' : ''}`}
                        >
                            <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
                            <span>{post.is_saved ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
