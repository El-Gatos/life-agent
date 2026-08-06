import { useEffect, useState } from 'react';
import { deadlineAPI } from '../services/api';
import DeadlineCard from '../components/DeadlineCard';
import { Clock } from 'lucide-react';

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, [filter, priorityFilter]);

  const fetchDeadlines = async () => {
    try {
      const res = await deadlineAPI.getAll(filter, priorityFilter);
      setDeadlines(res.data.deadlines || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: null, label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8 animate-fade">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-gray-700 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Deadlines</h1>
        </div>
        <p className="text-gray-400 dark:text-gray-500">View and manage all your assignments</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Status</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === value
                      ? 'bg-gray-900 dark:bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Priority</label>
            <select
              value={priorityFilter || ''}
              onChange={(e) => setPriorityFilter(e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
            >
              {priorityOptions.map(({ value, label }) => (
                <option key={value} value={value || ''}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deadlines */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.length > 0 ? (
            deadlines.map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} onStatusChange={fetchDeadlines} />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <p className="text-gray-400 dark:text-gray-500">No deadlines found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}