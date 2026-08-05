import { LayoutDashboard, CheckSquare, Clock, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/deadlines', icon: Clock, label: 'Deadlines' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-72 bg-white border-r border-[#e2e8f0] flex flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <h1 className="text-xl font-bold text-[#1e293b]">📚 Life Agent</h1>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#3b82f6] rounded-full flex items-center justify-center text-white font-bold text-lg">
            JD
          </div>
          <div>
            <p className="font-semibold text-[#1e293b]">Jacob</p>
            <p className="text-xs text-[#94a3b8]">Student</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(path)
                ? 'bg-[#1e293b] text-white'
                : 'text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#e2e8f0]">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}