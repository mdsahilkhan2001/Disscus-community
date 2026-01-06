import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPostsQuery, useGetPostQuery, useGetCommentsQuery, useCreateCommentMutation, useVoteCommentMutation, useSavePostMutation } from '../features/api/apiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, ArrowLeft, Send, Reply, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils';

// Helper to build comment tree
const buildCommentTree = (comments) => {
    if (!comments) return [];
    const commentMap = {};
    const roots = [];

    // First pass: create map and initialize children
    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, children: [] };
    });

    // Second pass: link parents and children
    comments.forEach(comment => {
        if (comment.parent) {
            if (commentMap[comment.parent]) {
                commentMap[comment.parent].children.push(commentMap[comment.id]);
            }
        } else {
            roots.push(commentMap[comment.id]);
        }
    });

    // Sort by created_at (newest first for roots? or oldest?) 
    // Usually Reddit style is top-level sorted by "best" or time, children by time.
    // Let's sort all by newest for now.
    roots.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return roots;
};

const CommentItem = ({ comment, user, postId, onReply, nestingLevel = 0 }) => {
    const { addToast } = useToast();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [voteComment] = useVoteCommentMutation();
    const navigate = useNavigate();

    const handleVote = async (value) => {
        if (!user) {
            addToast('Please login to vote', 'info');
            navigate('/login');
            return;
        }
        try {
            await voteComment({ id: comment.id, value, postId }).unwrap();
        } catch (err) {
            console.error('Failed to vote comment:', err);
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        await onReply(comment.id, replyText);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div className={`mt-4 ${nestingLevel > 0 ? 'ml-3 sm:ml-10 border-l-2 border-gray-100 pl-3 sm:pl-4' : ''}`}>
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    {comment.author.profile_picture ? (
                        <img src={comment.author.profile_picture} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {comment.author.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-xs mb-1">
                        <span className="font-bold text-gray-900">{comment.author.username}</span>
                        <span className="text-gray-500">• {new Date(comment.created_at).toLocaleDateString()}</span>
                        {comment.author.role === 'ADMIN' && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">ADMIN</span>}
                        {comment.author.role === 'FACULTY' && <span className="text-xs bg-indigo-100 text-indigo-600 px-1 rounded">FACULTY</span>}
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </div>

                    <div className="flex items-center space-x-4 mt-2">
                        {/* Vote Controls */}
                        <div className="flex items-center space-x-1 bg-gray-50 rounded p-0.5">
                            <button
                                onClick={() => handleVote(1)}
                                className={`p-1 rounded hover:bg-gray-200 transition-colors ${comment.user_vote === 1 ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                            >
                                <ArrowBigUp className={`w-4 h-4 ${comment.user_vote === 1 ? 'fill-current' : ''}`} />
                            </button>
                            <span className={`text-xs font-bold ${comment.user_vote === 1 ? 'text-orange-500' : comment.user_vote === -1 ? 'text-blue-500' : 'text-gray-600'}`}>
                                {comment.vote_count || 0}
                            </span>
                            <button
                                onClick={() => handleVote(-1)}
                                className={`p-1 rounded hover:bg-gray-200 transition-colors ${comment.user_vote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                            >
                                <ArrowBigDown className={`w-4 h-4 ${comment.user_vote === -1 ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 text-xs font-bold transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Reply</span>
                        </button>
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-3">
                            {user ? (
                                <form onSubmit={handleSubmitReply} className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm min-h-[80px]"
                                        placeholder={`Replying to ${comment.author.username}...`}
                                        autoFocus
                                        required
                                    />
                                    <div className="flex justify-end mt-2 space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsReplying(false)}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 flex items-center"
                                        >
                                            Reply <Send className="w-3 h-3 ml-1" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-xs text-red-500">Please login to reply.</p>
                            )}
                        </div>
                    )}

                    {/* Nested Children */}
                    {comment.children && comment.children.length > 0 && (
                        <div className="mt-2">
                            {comment.children.map(child => (
                                <CommentItem
                                    key={child.id}
                                    comment={child}
                                    user={user}
                                    postId={postId}
                                    onReply={onReply}
                                    nestingLevel={nestingLevel + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const user = useSelector(selectCurrentUser);

    // Fetch Post and Comments
    const { data: post, isLoading: isPostLoading } = useGetPostQuery(id);
    const { data: comments, isLoading: isCommentsLoading } = useGetCommentsQuery(id, { skip: !id });

    const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
    const [commentText, setCommentText] = useState('');
    const [savePost] = useSavePostMutation();

    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

    const handleCreateComment = async (parentId = null, content) => {
        try {
            await createComment({ post: id, content, parent: parentId }).unwrap();
            addToast('Comment posted successfully!', 'success');
            return true;
        } catch (err) {
            console.error('Failed to post comment:', err);
            addToast('Failed to post comment.', 'error');
            return false;
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const success = await handleCreateComment(null, commentText);
        if (success) {
            setCommentText('');
        }
    };

    // Wrapper for child replies
    const handleReply = async (parentId, content) => {
        return await handleCreateComment(parentId, content);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast('Link copied to clipboard!', 'success');
    };

    const handleSave = async () => {
        if (!user) {
            addToast('Please login to save posts.', 'info');
            return;
        }
        try {
            const result = await savePost(id).unwrap();
            addToast(result.is_saved ? 'Post saved!' : 'Post unsaved!', 'success');
        } catch (err) {
            console.error("Failed to save post:", err);
            addToast('Failed to save post.', 'error');
        }
    };

    if (isPostLoading) return <div className="text-center py-10">Loading post...</div>;
    if (!post) return <div className="text-center py-10">Post not found</div>;

    return (
        <div className="bg-white rounded border border-gray-300">
            {/* Header / Back Button */}
            <div className="p-2 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Back
                </button>
            </div>

            <div className="flex">
                {/* Vote Sidebar */}
                <div className="w-12 bg-gray-50/50 flex flex-col items-center py-4 space-y-1 rounded-l text-gray-500 border-r border-gray-100">
                    <button
                        className={`p-1 rounded hover:bg-gray-200 ${post.user_vote === 1 ? 'text-orange-500' : 'hover:text-orange-500'}`}
                    >
                        <ArrowBigUp className={`w-6 h-6 ${post.user_vote === 1 ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`text-sm font-bold my-1 ${post.user_vote === 1 ? 'text-orange-500' : post.user_vote === -1 ? 'text-blue-500' : ''}`}>
                        {post.vote_count}
                    </span>
                    <button
                        className={`p-1 rounded hover:bg-gray-200 ${post.user_vote === -1 ? 'text-blue-500' : 'hover:text-blue-500'}`}
                    >
                        <ArrowBigDown className={`w-6 h-6 ${post.user_vote === -1 ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-4 flex-1">
                    {/* Post Metadata */}
                    <div className="flex items-center text-xs text-gray-500 mb-2 space-x-1">
                        {post.category_detail && (
                            <span className="font-bold text-gray-700">{post.category_detail.name}</span>
                        )}
                        <span>•</span>
                        <span>Posted by u/{post.author.username}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Post Title & Body */}
                    <h1 className="text-2xl font-medium text-gray-900 mb-4">{post.title}</h1>
                    {post.content && <p className="text-gray-800 mb-6 whitespace-pre-wrap">{post.content}</p>}

                    {/* Multiple Images Grid */}
                    {post.images && post.images.length > 0 ? (
                        <div className={`mb-6 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                            {post.images.map((img, index) => (
                                <div key={img.id} className="rounded-lg overflow-hidden border border-gray-200 bg-black flex justify-center max-h-[600px]">
                                    <img src={getMediaUrl(img.image)} alt={`Post image ${index + 1}`} className="max-h-full max-w-full object-contain" />
                                </div>
                            ))}
                        </div>
                    ) : post.image && (
                        <div className="mb-6 rounded-lg overflow-hidden bg-black flex justify-center border border-gray-200">
                            <img src={getMediaUrl(post.image)} alt={post.title} className="max-h-[600px] max-w-full object-contain" />
                        </div>
                    )}

                    {/* Video Section */}
                    {post.video && (
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-black max-h-[512px]">
                            <video controls className="w-full h-full max-h-[512px]">
                                <source src={getMediaUrl(post.video)} />
                            </video>
                        </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center space-x-4 text-gray-500 text-xs font-bold border-t border-gray-100 pt-3">
                        <div className="flex items-center space-x-1">
                            <MessageSquare className="w-5 h-5" />
                            <span>{comments?.length || 0} Comments</span>
                        </div>
                        <button onClick={handleShare} className="flex items-center hover:bg-gray-100 px-2 py-2 rounded space-x-1">
                            <Share2 className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                        <button onClick={handleSave} className={`flex items-center px-2 py-2 rounded space-x-1 ${post.is_saved ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
                            <span>{post.is_saved ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-8 bg-gray-50/50 -mx-4 px-4 py-6 border-t border-gray-200">

                        {/* Comment Input */}
                        {user ? (
                            <div className="mb-8">
                                <p className="text-sm text-gray-700 mb-2">Comment as <span className="font-bold text-indigo-600">{user.username}</span></p>
                                <form onSubmit={handleSubmitComment} className="relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                                        placeholder="What are your thoughts?"
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                                        >
                                            {isSubmitting ? 'Posting...' : (
                                                <>Comment <Send className="w-4 h-4 ml-2" /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                                Please <a href="/login" className="font-bold underline">log in</a> to leave a comment.
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            {isCommentsLoading ? (
                                <p className="text-gray-500 text-sm">Loading comments...</p>
                            ) : commentTree.length > 0 ? (
                                commentTree.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        user={user}
                                        postId={id}
                                        onReply={handleReply}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;
