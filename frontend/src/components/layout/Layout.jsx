import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="pt-16 w-full max-w-[1600px] mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
                <Sidebar />
                <main className="flex-1 min-w-0 w-full lg:max-w-[800px] xl:max-w-[1000px] py-6 lg:px-8">
                    {children}
                </main>
                <RightSidebar />
            </div>
        </div>
    );
};

export default Layout;

