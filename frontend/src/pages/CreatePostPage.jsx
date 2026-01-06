import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePostMutation, useGetCategoriesQuery, useCreateCategoryMutation } from '../features/api/apiSlice';
import { Image as ImageIcon, Link as LinkIcon, Video as VideoIcon, Type, X, UploadCloud, Search, ChevronDown, Plus, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const [createPost, { isLoading }] = useCreatePostMutation();
    const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
    const { data: categories } = useGetCategoriesQuery();
    const { addToast } = useToast();

    // Dropdown & Modal State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '' });


    useEffect(() => {
        if (user && user.role === 'STUDENT') {
            addToast("Students are not allowed to create posts.", "error");
            navigate('/');
        }
    }, [user, navigate, addToast]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        link_url: '',
    });

    const [mediaFiles, setMediaFiles] = useState({
        images: [],
        video: null
    });

    // Helper to get selected category name
    const selectedCategoryName = categories?.find(c => c.id == formData.category)?.name || "Select a Community";

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit to 5 images for now (optional)
            if (mediaFiles.images.length + filesArray.length > 10) {
                addToast("You can only upload up to 10 images.", "error");
                return;
            }
            setMediaFiles(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
        }
    };

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFiles(prev => ({ ...prev, video: e.target.files[0] }));
        }
    };

    const removeImage = (index) => {
        setMediaFiles(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeVideo = () => {
        setMediaFiles(prev => ({ ...prev, video: null }));
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        if (!newCommunity.name) return;

        const slug = newCommunity.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

        try {
            const result = await createCategory({ ...newCommunity, slug }).unwrap();
            addToast('Community created!', 'success');
            setFormData({ ...formData, category: result.id });
            setIsCreateModalOpen(false);
            setNewCommunity({ name: '', description: '' });
            setIsDropdownOpen(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to create community.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            addToast("Please select a community.", "error");
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('category', formData.category);
        data.append('post_type', 'MIXED');

        if (formData.link_url) data.append('link_url', formData.link_url);

        // Append all images
        mediaFiles.images.forEach(image => {
            data.append('uploaded_images', image);
        });

        if (mediaFiles.video) data.append('video', mediaFiles.video);

        try {
            await createPost(data).unwrap();
            addToast("Post created successfully!", "success");
            navigate('/');
        } catch (err) {
            console.error('Failed to create post:', err);
            addToast("Failed to create post. Please try again.", "error");
        }
    };

    // Filter categories for dropdown
    const filteredCategories = categories?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Create a Post</h1>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">

                    {/* Community Selector (Custom Dropdown) */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Community</label>

                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full md:w-1/2 flex items-center justify-between border-gray-300 rounded-lg shadow-sm border py-3 px-4 bg-gray-50 hover:bg-white transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <span className={`block truncate ${!formData.category ? 'text-gray-500' : 'text-gray-900'}`}>
                                {selectedCategoryName}
                            </span>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full md:w-1/2 bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Search communities..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {filteredCategories?.length > 0 ? (
                                    filteredCategories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${formData.category == cat.id ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'}`}
                                            onClick={() => {
                                                setFormData({ ...formData, category: cat.id });
                                                setIsDropdownOpen(false);
                                                setSearchTerm('');
                                            }}
                                        >
                                            <span className={`block truncate ${formData.category == cat.id ? 'font-semibold' : 'font-normal'}`}>
                                                {cat.name}
                                            </span>
                                            {formData.category == cat.id && (
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                    <Check className="h-5 w-5" />
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2 px-4 text-sm text-gray-500">No communities found.</div>
                                )}

                                {/* Create New Option */}
                                {(user?.role === 'FACULTY' || user?.role === 'ADMIN') && (
                                    <div
                                        onClick={() => {
                                            if (searchTerm) setNewCommunity({ ...newCommunity, name: searchTerm });
                                            setIsCreateModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="border-t border-gray-100 cursor-pointer select-none relative py-3 pl-3 pr-9 bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-medium flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Community {searchTerm && `"${searchTerm}"`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-6">
                        {/* Title Input */}
                        <div className="relative">
                            <input
                                type="text"
                                required
                                maxLength={300}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg sm:text-xl font-medium p-3 sm:p-4 border placeholder-gray-400"
                                placeholder="Give your post a title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <div className="absolute top-4 right-4 text-xs text-gray-400 pointer-events-none">
                                {formData.title.length}/300
                            </div>
                        </div>

                        {/* Text Body */}
                        <div className="relative">
                            <textarea
                                rows={8}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base p-3 sm:p-4 border placeholder-gray-400 resize-y min-h-[150px]"
                                placeholder="What's on your mind? Share your thoughts..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Media Upload Section */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
                        <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Add to your post</label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Image Upload */}
                            <div className="col-span-1 md:col-span-3">
                                <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 group">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="p-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                                            <ImageIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                                            Click to upload images
                                        </span>
                                        <span className="text-xs text-gray-400">SVG, PNG, JPG or GIF (Max 10)</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {/* Image Previews */}
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
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Video Upload */}
                            <div>
                                <label className={`flex flex-col items-center justify-center w-full h-24 border cursor-pointer rounded-lg hover:bg-gray-100 transition-colors ${mediaFiles.video ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`}>
                                    <VideoIcon className={`w-6 h-6 mb-1 ${mediaFiles.video ? 'text-green-600' : 'text-red-500'}`} />
                                    <span className="text-xs font-medium text-gray-700">
                                        {mediaFiles.video ? 'Video Added' : 'Upload Video'}
                                    </span>
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                </label>
                                {mediaFiles.video && (
                                    <div className="flex items-center justify-between mt-2 text-xs bg-white p-2 border rounded shadow-sm">
                                        <span className="truncate max-w-[150px]">{mediaFiles.video.name}</span>
                                        <button type="button" onClick={removeVideo} className="text-red-500 hover:text-red-700"><X className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>

                            {/* Link Input */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="relative h-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        className="block w-full h-24 pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm border p-4 bg-white"
                                        placeholder="Add a Link URL (optional)"
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
                            onClick={() => navigate('/')}
                            className="mr-4 px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center items-center px-8 py-3 border border-transparent shadow-lg text-base font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <UploadCloud className="animate-bounce w-5 h-5 mr-2" />
                                    Posting...
                                </>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Create Community Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={() => setIsCreateModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Community</h3>
                                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <form onSubmit={handleCreateCommunity} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Community Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newCommunity.name}
                                                onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="e.g. Computer Science"
                                            />
                                        </div>
                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="submit"
                                                disabled={isCreatingCategory}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                            >
                                                {isCreatingCategory ? 'Creating...' : 'Create & Select'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsCreateModalOpen(false)}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePostPage;
