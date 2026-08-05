import React from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import ThemeToggle from './ThemeToggle'; // Assuming you drop the toggle component in the same folder

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-transparent transition-colors duration-200">
      
      {/* Left Navigation */}
      <Sidebar />

      {/* Main Center Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* The Top Header Bar from the screenshot */}
        <header className="flex items-center justify-between px-8 py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
          
          {/* Placeholder for your Home / Time Table tabs */}
          <nav className="flex gap-4">
            <button className="px-4 py-2 font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">Home</button>
            <button className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400">Time Table</button>
          </nav>

          {/* Right side of header: Password, Logout, and the Toggle */}
          <div className="flex items-center gap-6">
            <button className="text-sm font-bold text-gray-700 dark:text-gray-300">Change Password</button>
            <button className="text-sm font-bold text-gray-700 dark:text-gray-300">Logout</button>
            
            {/* The actual toggle component */}
            <ThemeToggle />
          </div>
        </header>

        {/* This is where your Dashboard.jsx or other pages will render */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Optional Right Sidebar (if you want to pull Announcements out of Dashboard.jsx later) */}
      {/* <RightSidebar /> */}
      
    </div>
  );
};

export default Layout;