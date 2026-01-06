import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { useGetCategoriesQuery } from '../../features/api/apiSlice';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
    const { data: categories, isLoading, isError } = useGetCategoriesQuery();

    // Take top 5 categories
    const popularCommunities = categories ? categories.slice(0, 5) : [];

    return (
        <div className="hidden xl:block w-80 pl-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-6 py-4">
                {/* Popular Communities */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Popular Communities</h3>
                    </div>

                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : isError ? (
                        <div className="p-4 text-center text-red-500 text-sm">Failed to load</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {popularCommunities.map((category, index) => (
                                <Link
                                    to={`/?category=${category.slug}`}
                                    key={category.id}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">{category.name}</span>
                                            <span className="text-xs text-gray-500">{category.post_count || 0} posts</span>
                                        </div>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="p-3 text-center">
                        <Link to="/communities" className="text-indigo-600 text-xs font-bold hover:underline">See All</Link>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default RightSidebar;
