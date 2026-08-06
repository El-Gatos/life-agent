import React from 'react';
import StatCard from '../components/StatCard';
// Assuming you're using lucide-react or heroicons. Update these imports based on your setup.
import { PenTool, Calculator, Cpu, Database, Shield } from 'lucide-react'; 

export default function Dashboard() {
  // Mock data mapping perfectly to your screenshot
  const attendanceData = [
    { id: 1, icon: PenTool, title: 'Engineering Graphics', fraction: '12/14', percentage: 86 },
    { id: 2, icon: Calculator, title: 'Mathematical Engineering', fraction: '27/29', percentage: 93 },
    { id: 3, icon: Cpu, title: 'Computer Architecture', fraction: '27/30', percentage: 81 },
    { id: 4, icon: Database, title: 'Database Management', fraction: '24/25', percentage: 96 },
    { id: 5, icon: Shield, title: 'Network Security', fraction: '25/27', percentage: 92 },
  ];

  const timetableData = [
    { id: 1, time: '10-11 AM', room: '33-309', subject: 'DBMS130', type: 'Lecture' },
    { id: 2, time: '11-12 AM', room: '38-719', subject: 'CS200', type: 'Lecture' },
    { id: 3, time: '01-02 PM', room: '33-309', subject: 'MTH166', type: 'Lecture' },
  ];

  const announcements = [
    { id: 1, type: 'Academic', text: 'Summer training internship with Live Projects.', time: '2 Minutes Ago' },
    { id: 2, type: 'Co-curricular', text: 'Global internship opportunity by Student organization.', time: '10 Minutes Ago' },
    { id: 3, type: 'Examination', text: 'Instructions for Mid Term Examination.', time: 'Yesterday' },
  ];

  const teachersOnLeave = [
    { id: 1, name: 'The Professor', status: 'Full Day', img: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Lisa Manobal', status: 'Half Day', img: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Himanshu Jindal', status: 'Full Day', img: 'https://i.pravatar.cc/150?u=3' },
  ];

  return (
    <div className="flex flex-col gap-8 lg:flex-row min-h-screen bg-slate-50 dark:bg-gray-900 p-8 transition-colors duration-200">
      
      {/* LEFT COLUMN: Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Attendance Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Attendance</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {attendanceData.map((stat) => (
              <StatCard 
                key={stat.id}
                icon={stat.icon}
                title={stat.title}
                fraction={stat.fraction}
                percentage={stat.percentage}
              />
            ))}
          </div>
        </section>

        {/* Timetable Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Today's Timetable</h2>
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-6 transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 px-4">Time</th>
                    <th className="pb-4 px-4">Room No.</th>
                    <th className="pb-4 px-4">Subject</th>
                    <th className="pb-4 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {timetableData.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0 text-gray-600 dark:text-gray-300 text-sm font-medium">
                      <td className="py-4 px-4">{row.time}</td>
                      <td className="py-4 px-4">{row.room}</td>
                      <td className="py-4 px-4">{row.subject}</td>
                      <td className="py-4 px-4 text-gray-400">{row.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Sidebars */}
      <div className="w-full lg:w-96 flex flex-col gap-8">
        
        {/* Announcements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Announcements</h2>
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-6 flex flex-col gap-6 transition-colors duration-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <span className="font-bold text-gray-900 dark:text-white mr-1">{announcement.type}</span> 
                  {announcement.text}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{announcement.time}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Teachers on Leave */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Teachers on leave</h2>
          <div className="flex flex-col gap-4">
            {teachersOnLeave.map((teacher) => (
              <div key={teacher.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none p-4 flex items-center gap-4 transition-colors duration-200">
                <img src={teacher.img} alt={teacher.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{teacher.name}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{teacher.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}