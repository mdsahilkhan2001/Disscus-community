import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../features/auth/authSlice';
import { useToast } from '../../context/ToastContext';
import { Search, User, LogOut, PlusSquare, Menu, X, Hash, HelpCircle } from 'lucide-react';

import discussLogo from '../../assets/discuss_logo.png';

const Navbar = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
        addToast('Logged out successfully', 'info');
        navigate('/login');
        setIsMenuOpen(false);
    };

    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchQuery}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden mr-2">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <X className="block h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Menu className="block h-6 w-6" aria-hidden="true" />
                                )}
                            </button>
                        </div>

                        <Link to="/" className="flex-shrink-0 flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
                            <img src={discussLogo} alt="Discuss Community Logo" className="h-10 w-auto rounded-xl shadow-sm" />
                            <span className="text-xl font-bold text-slate-800 hidden md:block tracking-tight">
                                Discuss Community
                            </span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `${isActive
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/latest"
                                className={({ isActive }) =>
                                    `${isActive
                                        ? 'border-indigo-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                                }
                            >
                                Latest
                            </NavLink>

                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
                        <div className="max-w-lg w-full lg:max-w-xs">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="search"
                                    name="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Search..."
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex sm:items-center">
                        {user ? (
                            <>
                                {user.role !== 'STUDENT' && (
                                    <Link to="/submit" className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center">
                                        <PlusSquare className="h-4 w-4 mr-2" />
                                        Create Post
                                    </Link>
                                )}
                                <div className="ml-4 flex items-center">
                                    <Link to="/help" className="text-gray-500 hover:text-indigo-600 mr-4 transition-colors" title="Contact Support">
                                        <HelpCircle className="h-6 w-6" />
                                    </Link>
                                    <Link to="/dashboard" className="text-gray-700 text-sm font-medium mr-2 hover:text-indigo-600 transition-colors">
                                        {user.username}
                                    </Link>
                                    <button onClick={handleLogout} className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none" title="Log out">
                                        <LogOut className="h-6 w-6" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="ml-4 flex items-center space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">Log in</Link>
                                <Link to="/help" className="px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-sm transition-colors">
                                    Contact Us
                                </Link>
                                <Link to="/register" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-gradient hover:opacity-90 shadow-sm">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile User/Action (simplified, just search + maybe create?) actually search is already there. */}
                    {/* We rely on the menu for text interactions */}
                </div>
            </div>

            {/* Mobile Menu, show/hide based on menu state */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-200">
                    <div className="pt-2 pb-3 space-y-1">
                        <NavLink
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                }`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/latest"
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                }`
                            }
                        >
                            Latest
                        </NavLink>
                        <NavLink
                            to="/help"
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                }`
                            }
                        >
                            Contact Us
                        </NavLink>
                        <Link
                            to="/communities"
                            onClick={() => setIsMenuOpen(false)}
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                        >
                            <div className="flex items-center">
                                <Hash className="w-4 h-4 mr-2" />
                                All Communities
                            </div>
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200">
                        {user ? (
                            <div className="space-y-1">
                                <div className="flex items-center px-4 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">{user.username}</div>
                                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                >
                                    Dashboard
                                </Link>
                                {user.role !== 'STUDENT' && (
                                    <Link
                                        to="/submit"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                    >
                                        Create Post
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1 px-4">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-center w-full mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-gradient hover:opacity-90"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
