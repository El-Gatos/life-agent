import { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { Save, Bell } from 'lucide-react';

export default function Settings() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await notificationAPI.getPreferences();
      setPrefs(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setPrefs({ ...prefs, [field]: !prefs[field] });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await notificationAPI.updatePreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8 animate-fade">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-gray-700 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-400 dark:text-gray-500">Manage your preferences</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>

        <div className="space-y-4 mb-6">
          {[
            { field: 'enabled', label: 'Enable notifications', desc: 'Receive desktop notifications' },
            { field: 'send_email_reminders', label: 'Email reminders', desc: 'Get email alerts for deadlines' },
            { field: 'send_calendar_alerts', label: 'Calendar alerts', desc: 'Notifications for events' },
            { field: 'send_overdue_alerts', label: 'Overdue alerts', desc: 'Alerts for overdue tasks' },
          ].map(({ field, label, desc }) => (
            <label key={field} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={prefs?.[field] || false}
                onChange={() => handleToggle(field)}
                className="w-5 h-5 rounded accent-gray-900 dark:accent-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-blue-600 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-blue-500 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          {saved && <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-3">✓ Saved!</p>}
        </div>
      </div>
    </div>
  );
}