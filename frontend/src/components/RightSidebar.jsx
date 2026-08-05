import { useEffect, useState } from 'react';
import { deadlineAPI } from '../services/api';
import { Bell, AlertCircle } from 'lucide-react';

export default function RightSidebar() {
  const [stats, setStats] = useState(null);
  const [recentDeadlines, setRecentDeadlines] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        deadlineAPI.getStats(),
        deadlineAPI.getUpcoming(),
      ]);
      setStats(statsRes.data);
      setRecentDeadlines(upcomingRes.data.deadlines.slice(0, 3));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-[#e2e8f0] overflow-auto sticky top-0 h-screen">
      {/* Header */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#f1f5f9] rounded-lg">
            <AlertCircle className="w-5 h-5 text-[#1e293b]" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b]">Updates</h3>
        </div>
      </div>

      {/* Recent Deadlines */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <h4 className="font-semibold text-[#1e293b] mb-4 text-sm uppercase tracking-wide">Upcoming</h4>
        <div className="space-y-3">
          {recentDeadlines.length > 0 ? (
            recentDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-3 rounded-lg bg-[#f8f9fa] hover:bg-[#f1f5f9] transition-colors">
                <p className="text-sm font-medium text-[#1e293b] line-clamp-2">{deadline.title}</p>
                <p className="text-xs text-[#94a3b8] mt-1">
                  {new Date(deadline.due_date).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#94a3b8]">No upcoming deadlines</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <h4 className="font-semibold text-[#1e293b] mb-4 text-sm uppercase tracking-wide">Stats</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-[#f8f9fa]">
            <span className="text-sm text-[#64748b]">Tasks Due</span>
            <span className="font-bold text-[#ef4444]">{stats?.due_this_week || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-[#f8f9fa]">
            <span className="text-sm text-[#64748b]">Pending</span>
            <span className="font-bold text-[#f59e0b]">{stats?.pending || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-[#f8f9fa]">
            <span className="text-sm text-[#64748b]">Completed</span>
            <span className="font-bold text-[#10b981]">{stats?.completed || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}