import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Eye, Heart, Share2, ArrowLeft } from 'lucide-react';
import { vlogData } from '../data/vlogData';

const VlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = vlogData.find(p => p.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Post not found</h2>
                    <button
                        onClick={() => navigate('/vlog')}
                        className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Return to Vlogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Nav Back */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <button
                        onClick={() => navigate('/vlog')}
                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Vlogs</span>
                    </button>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Article Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Vlog
                        </span>
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {post.date}
                        </span>
                        <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1.5" />
                            {post.views} views
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg ring-4 ring-indigo-50">
                            {post.author.charAt(0)}
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm font-bold text-gray-900">{post.author}</p>
                            <p className="text-xs text-gray-500">{post.role}</p>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-10">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
                    <div
                        className="prose prose-lg prose-indigo max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                    <div className="flex space-x-4">
                        <button className="flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all font-medium shadow-sm">
                            <Heart className="w-5 h-5 mr-2" />
                            Like
                        </button>
                        <button className="flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all font-medium shadow-sm">
                            <Share2 className="w-5 h-5 mr-2" />
                            Share
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default VlogDetailPage;
