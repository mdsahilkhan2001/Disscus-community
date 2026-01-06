import React, { useState } from 'react';
import { useRegisterMutation } from '../features/api/apiSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { User, GraduationCap, Mail, Lock, UserCircle, Eye, EyeOff } from 'lucide-react';

import Navbar from '../components/layout/Navbar';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData).unwrap();
            addToast('Registration successful! Please login.', 'success');
            navigate('/login');
        } catch (err) {
            console.error('Failed to register:', err);
            const msg = err.data?.detail || 'Registration failed. Please try again.';
            setError(msg);
            addToast(msg, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
                <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join our community today
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="rounded-md shadow-sm space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircle className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-20"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ?
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> :
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${formData.role === 'STUDENT' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-500'}`}
                                >
                                    <GraduationCap className={`h-8 w-8 mb-2 ${formData.role === 'STUDENT' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="font-semibold text-sm">Student</span>
                                </div>
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'FACULTY' })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${formData.role === 'FACULTY' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-500'}`}
                                >
                                    <User className={`h-8 w-8 mb-2 ${formData.role === 'FACULTY' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="font-semibold text-sm">Faculty</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                            >
                                {isLoading ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
