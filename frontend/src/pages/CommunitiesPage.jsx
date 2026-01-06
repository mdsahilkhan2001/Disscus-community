import React, { useState } from 'react';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../features/api/apiSlice';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useToast } from '../context/ToastContext';

const CommunitiesPage = () => {
    const { data: categories, isLoading, isError } = useGetCategoriesQuery();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
    const user = useSelector(selectCurrentUser);
    const { addToast } = useToast();

    // const canCreate = user && (user.role === 'FACULTY' || user.role === 'ADMIN');
    const canDelete = (category) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return category.created_by?.id === user.id;
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
            try {
                await deleteCategory(id).unwrap();
                addToast('Community deleted.', 'success');
            } catch (err) {
                console.error(err);
                addToast('Failed to delete community.', 'error');
            }
        }
    };



    if (isLoading) return <div className="text-center py-10">Loading communities...</div>;
    if (isError) return <div className="text-center py-10 text-red-500">Failed to load communities</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-5 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Communities</h1>
                    <p className="mt-2 text-sm text-gray-500">Browse all the active communities and topics.</p>
                </div>
                {/* Create Button Removed */}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories?.map((category) => (
                    <div key={category.id} className="relative group flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                        <Link to={`/?category=${category.slug}`} className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {category.icon ? (
                                        <img src={category.icon} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Users className="h-6 w-6" />
                                    )}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                {category.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                <TrendingUp className="w-4 h-4 mr-1.5 text-green-500" />
                                <span>{category.post_count || 0} posts</span>
                            </div>

                            {/* Creator Badge */}
                            {category.created_by && (
                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                                    Created by {category.created_by.username}
                                </div>
                            )}
                        </Link>

                        {/* Delete Action */}
                        {canDelete(category) && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(category.id, category.name);
                                }}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all font-bold"
                                title="Delete Community"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {categories?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <p className="text-gray-500">No communities found.</p>
                </div>
            )}

            {/* Create Modal Removed */}
        </div>
    );
};

export default CommunitiesPage;
