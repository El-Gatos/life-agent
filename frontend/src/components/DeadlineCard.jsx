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

  const getPriorityBg = (priority) => {
    const colors = {
      high: 'bg-[#fee2e2]',
      medium: 'bg-[#fef3c7]',
      low: 'bg-[#dcfce7]',
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityText = (priority) => {
    const colors = {
      high: 'text-[#991b1b]',
      medium: 'text-[#b45309]',
      low: 'text-[#166534]',
    };
    return colors[priority] || colors.medium;
  };

  const getUrgencyLeft = () => {
    if (isOverdue) return 'border-l-4 border-l-[#ef4444]';
    if (daysUntil <= 1) return 'border-l-4 border-l-[#f59e0b]';
    if (daysUntil <= 3) return 'border-l-4 border-l-[#f59e0b]';
    return 'border-l-4 border-l-[#d1d5db]';
  };

  return (
    <div className={`bg-white p-5 rounded-lg border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all animate-fade ${getUrgencyLeft()}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-[#1e293b]">{deadline.title}</h3>
          <p className="text-xs text-[#94a3b8] mt-1">{format(new Date(deadline.due_date), 'MMM d, yyyy')}</p>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-medium ${getPriorityBg(deadline.priority)} ${getPriorityText(deadline.priority)}`}>
          {deadline.priority}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#64748b]">
          <Clock className="w-4 h-4" />
          {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
        </div>

        <div className="flex gap-2">
          {deadline.status !== 'completed' && (
            <>
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
              >
                Done
              </button>
            </>
          )}
          {deadline.status === 'completed' && (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#dcfce7] text-[#166534] rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </div>
          )}
        </div>
      </div>
    </div>
  );
}