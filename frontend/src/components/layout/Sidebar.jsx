import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hash, HelpCircle, BookOpen, Video } from 'lucide-react';
import { useGetCategoriesQuery } from '../../features/api/apiSlice';

const Sidebar = () => {
    const { data: categories, isLoading } = useGetCategoriesQuery();

    return (
        <div className="hidden lg:block w-64 bg-white h-[calc(100vh-4rem)] sticky top-16 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
                <nav className="space-y-1 mb-6">
                    <NavLink
                        to="/vlog"
                        className={({ isActive }) =>
                            `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Video className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        <span className="truncate">Vlogs</span>
                    </NavLink>
                    <NavLink
                        to="/help"
                        className={({ isActive }) =>
                            `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <HelpCircle className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        <span className="truncate">Help & Support</span>
                    </NavLink>
                </nav>

                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Categories
                </h3>
                <nav className="space-y-1">
                    {isLoading && <div className="px-3 text-sm text-gray-400">Loading...</div>}
                    {/* All Communities Link */}
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Hash className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        <span className="truncate">All Communities</span>
                    </NavLink>

                    {categories?.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/r/${category.slug}`}
                            className={({ isActive }) =>
                                `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {category.icon ? (
                                <img src={category.icon} alt="" className="w-5 h-5 mr-3 rounded" />
                            ) : (
                                <Hash className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            )}
                            <span className="truncate">{category.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>


        </div>
    );
};

export default Sidebar;
