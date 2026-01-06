import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostQuery, useUpdatePostMutation, useGetCategoriesQuery, useDeletePostImageMutation } from '../features/api/apiSlice';
import { Image as ImageIcon, Link as LinkIcon, Video as VideoIcon, Type, X, UploadCloud, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const EditPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Fetch existing post data
    const { data: post, isLoading: isPostLoading, isError, error } = useGetPostQuery(id);
    const { data: categories } = useGetCategoriesQuery();
    const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
    const [deletePostImage] = useDeletePostImageMutation();

    // ... (state declarations remain the same) ...

    if (isPostLoading) return <div className="text-center py-10">Loading post...</div>;

    if (isError) {
        return (
            <div className="text-center py-10 text-red-600">
                <h2 className="text-xl font-bold">Error Loading Post</h2>
                <p>{error?.data?.detail || error?.status || "Unknown error"}</p>
                <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 underline">Back to Dashboard</button>
            </div>
        );
    }

    if (!post) return <div className="text-center py-10">Post not found.</div>;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        link_url: '',
    });

    const [mediaFiles, setMediaFiles] = useState({
        images: [], // New images to upload
        video: null // New video to upload
    });

    const handleDeleteExistingImage = async (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deletePostImage(imageId).unwrap();
                addToast('Image deleted successfully', 'success');
            } catch (err) {
                console.error('Failed to delete image:', err);
                addToast('Failed to delete image', 'error');
            }
        }
    };



    // Populate form when post data is loaded
    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                content: post.content,
                category: post.category,
                link_url: post.link_url || '',
            });
        }
    }, [post]);

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit total images (existing + new) logic can be added here
            setMediaFiles(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
        }
    };

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFiles(prev => ({ ...prev, video: e.target.files[0] }));
        }
    };

    const removeNewImage = (index) => {
        setMediaFiles(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeNewVideo = () => {
        setMediaFiles(prev => ({ ...prev, video: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('category', formData.category);

        // Handle link
        if (formData.link_url) {
            data.append('link_url', formData.link_url);
        } else {
            // If field is cleared, we might need to send empty string or handle backend to nullify
            data.append('link_url', '');
        }

        // Backend handling of "uploaded_images" for NEW images
        mediaFiles.images.forEach(image => {
            data.append('uploaded_images', image);
        });

        if (mediaFiles.video) data.append('video', mediaFiles.video);

        try {
            await updatePost({ id: id, data }).unwrap();
            addToast("Post updated successfully!", "success");
            navigate('/dashboard'); // Return to dashboard
        } catch (err) {
            console.error('Failed to update post:', err);
            addToast("Failed to update post. Please try again.", "error");
        }
    };

    if (isPostLoading) return <div className="text-center py-10">Loading post...</div>;
    if (!post) return <div className="text-center py-10">Post not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Community Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Community</label>
                        <select
                            required
                            className="block w-full md:w-1/2 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base py-3 px-4 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select a Community</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            )) || <option disabled>Loading...</option>}
                        </select>
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-6">
                        {/* Title Input */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                maxLength={300}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xl font-medium p-4 border placeholder-gray-400"
                                placeholder="Post Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Text Body */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                rows={8}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base p-4 border placeholder-gray-400 resize-y min-h-[150px]"
                                placeholder="Post content..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Current Media Display (Read Only for now or Delete logic could be added) */}
                    {/* Current Media Display */}
                    {(post.images?.length > 0 || post.image) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-gray-700 mb-2">Current Images</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {post.images?.map(img => (
                                    <div key={img.id} className="relative aspect-square rounded overflow-hidden border group">
                                        <img src={img.image} className="w-full h-full object-cover" alt="current" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingImage(img.id)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {post.image && (
                                    <div className="relative aspect-square rounded overflow-hidden border">
                                        <img src={post.image} className="w-full h-full object-cover" alt="current" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Media Upload Section */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Add New Media</label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Image Upload */}
                            <div className="col-span-1 md:col-span-3">
                                <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 group">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                            <ImageIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                                            Upload more images
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {/* New Image Previews */}
                                {mediaFiles.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {mediaFiles.images.map((file, index) => (
                                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Link Input */}
                            <div className="col-span-1 md:col-span-3">
                                <div className="relative h-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        className="block w-full h-12 pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm border p-4 bg-white"
                                        placeholder="Link URL"
                                        value={formData.link_url}
                                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="mr-4 px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="inline-flex justify-center items-center px-8 py-3 border border-transparent shadow-lg text-base font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPostPage;
