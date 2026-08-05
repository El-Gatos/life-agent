import { CheckCircle2, Circle } from 'lucide-react';
import { taskAPI } from '../services/api';
import { useState } from 'react';

export default function TaskItem({ task, onStatusChange }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskAPI.updateStatus(task.id, newStatus);
      onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card p-4 flex items-start gap-4 animate-fade ${
      task.status === 'completed' ? 'opacity-60' : ''
    }`}>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="mt-1 flex-shrink-0 text-[#94a3b8] hover:text-[#3b82f6] transition-colors"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-[#f1f5f9] ${
          task.status === 'completed' ? 'line-through text-[#94a3b8]' : ''
        }`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-[#cbd5e1] mt-1">{task.description}</p>
        )}
        {task.estimated_hours && (
          <div className="mt-2">
            <span className="text-xs badge badge-primary">⏱️ {task.estimated_hours}h</span>
          </div>
        )}
      </div>
    </div>
  );
}