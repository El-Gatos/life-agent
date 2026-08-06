import React from 'react';
import ThemeToggle from './ThemeToggle';
import ProfileCard from './ProfileCard';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, CheckSquare, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'deadlines', label: 'Deadlines', icon: Clock },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-colors duration-200">

      {/* Logo Area */}
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 dark:bg-blue-600">
          <span className="text-sm font-extrabold text-white">L</span>
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Life Agent</h1>
      </div>

      {/* User Profile */}
      <ProfileCard />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(`/${item.id}`);

          return (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-gray-900 text-white dark:bg-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
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