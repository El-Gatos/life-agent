import { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import TaskItem from '../components/TaskItem';
import { CheckSquare } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalHours = pendingTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 animate-fade">
        <div className="flex items-center gap-3 mb-2">
          <CheckSquare className="w-8 h-8 text-[#3b82f6]" />
          <h1 className="text-4xl font-bold text-[#1e293b]">Tasks</h1>
        </div>
        <p className="text-[#94a3b8]">Break down your deadlines into actionable steps</p>
      </div>

      {/* Stats */}
      {pendingTasks.length > 0 && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-[#94a3b8] text-sm font-medium mb-2">Pending Tasks</p>
            <p className="text-4xl font-bold text-[#1e293b]">{pendingTasks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-[#94a3b8] text-sm font-medium mb-2">Est. Time</p>
            <p className="text-4xl font-bold text-[#3b82f6]">{totalHours}h</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#3b82f6] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              Pending Tasks ({pendingTasks.length})
            </h2>
            {pendingTasks.length > 0 ? (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-[#e2e8f0]">
                <p className="text-[#94a3b8]">No pending tasks</p>
              </div>
            )}
          </div>

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}