import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Clock, CheckSquare, Settings } from 'lucide-react';

const Sidebar = () => {
  // You'll want to wire 'active' to your actual router state (e.g., useLocation)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'deadlines', label: 'Deadlines', icon: Clock, active: false },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, active: false },
    { id: 'settings', label: 'Settings', icon: Settings, active: false },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-colors duration-200">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="flex flex-wrap w-6 h-6 gap-0.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></span>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Life Agent</h1>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4 px-6 mb-8">
        <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-blue-500 rounded-full">
          JD
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Jacob</h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Student</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Swap the <a> tag for a <Link> if you are using react-router-dom
          return (
            <link
              key={item.id}
              href={`/${item.id}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                item.active
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </link>
          );
        })}
      </nav>

      {/* Footer with Theme Toggle */}
      <div className="p-6 mt-auto border-t border-gray-100 dark:border-gray-700 flex justify-center">
        <ThemeToggle />
      </div>

    </div>
  );
};

export default Sidebar;