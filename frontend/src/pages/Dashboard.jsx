import { useEffect, useState } from 'react';
import { deadlineAPI } from '../services/api';
import CircularProgress from '../components/CircularProgress';
import DeadlineCard from '../components/DeadlineCard';
import { TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setUpcomingDeadlines(upcomingRes.data.deadlines);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9fa]">
        <div className="w-12 h-12 border-4 border-[#e2e8f0] border-t-[#3b82f6] rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const pending = stats?.pending || 0;
  const thisWeek = stats?.due_this_week || 0;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-[#1e293b] mb-8">Dashboard</h1>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <CircularProgress
          value={completed}
          total={total || 1}
          label="Overall Progress"
          color="#3b82f6"
          icon={TrendingUp}
        />
        <CircularProgress
          value={pending}
          total={total || 1}
          label="Pending"
          color="#f59e0b"
          icon={Clock}
        />
        <CircularProgress
          value={thisWeek}
          total={total || 1}
          label="This Week"
          color="#ef4444"
          icon={AlertCircle}
        />
        <CircularProgress
          value={completed}
          total={total || 1}
          label="Completed"
          color="#10b981"
          icon={CheckCircle2}
        />
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <h2 className="text-2xl font-bold text-[#1e293b] mb-6">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} onStatusChange={fetchData} />
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg text-center border border-[#e2e8f0]">
              <p className="text-[#94a3b8]">No upcoming deadlines!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}