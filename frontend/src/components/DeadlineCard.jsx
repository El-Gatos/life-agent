import { format, differenceInDays, isPast } from 'date-fns';
import { Clock, CheckCircle2 } from 'lucide-react';
import { deadlineAPI } from '../services/api';
import { useState } from 'react';

export default function DeadlineCard({ deadline, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const daysUntil = differenceInDays(new Date(deadline.due_date), new Date());
  const isOverdue = isPast(new Date(deadline.due_date)) && deadline.status !== 'completed';

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await deadlineAPI.updateStatus(deadline.id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityClasses = (priority) => {
    const colors = {
      high: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
      medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    };
    return colors[priority] || colors.medium;
  };

  const getUrgencyLeft = () => {
    if (isOverdue) return 'border-l-4 border-l-red-500';
    if (daysUntil <= 3) return 'border-l-4 border-l-amber-500';
    return 'border-l-4 border-l-gray-200 dark:border-l-gray-600';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-gray-800/80 transition-all animate-fade ${getUrgencyLeft()}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{deadline.title}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{format(new Date(deadline.due_date), 'MMM d, yyyy')}</p>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-medium ${getPriorityClasses(deadline.priority)}`}>
          {deadline.priority}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
        </div>

        <div className="flex gap-2">
          {deadline.status !== 'completed' && (
            <>
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-500 transition-colors"
              >
                Done
              </button>
            </>
          )}
          {deadline.status === 'completed' && (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </div>
          )}
        </div>
      </div>
    </div>
  );
}