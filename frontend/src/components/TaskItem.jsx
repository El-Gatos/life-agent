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
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-4 animate-fade transition-colors duration-200 ${
      task.status === 'completed' ? 'opacity-60' : ''
    }`}>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="mt-1 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-900 dark:hover:text-blue-400 transition-colors"
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-gray-900 dark:text-white ${
          task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''
        }`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
        )}
        {task.estimated_hours && (
          <div className="mt-2">
            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
              {task.estimated_hours}h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}