import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { vlogData } from '../data/vlogData';

const VlogPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                            Camping Vlogs & Stories
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500">
                            Discover the latest stories, tutorials, and experiences shared by our community members.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vlogData.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => navigate(`/vlog/${post.id}`)}
                            className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-indigo-600 backdrop-blur-sm shadow-sm">
                                        Vlog
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1.5" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center">
                                            <Eye className="w-4 h-4 mr-1.5" />
                                            {post.views}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                        {post.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">
                                            {post.author.charAt(0)}
                                        </div>
                                        <div className="ml-2">
                                            <p className="text-sm font-medium text-gray-900">{post.author}</p>
                                            <p className="text-xs text-gray-500">{post.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-indigo-600 p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VlogPage;
