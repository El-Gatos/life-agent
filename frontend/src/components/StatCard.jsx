import React from 'react';
import CircularProgress from './CircularProgress';

const StatCard = ({ icon: Icon, title, fraction, percentage, colorClass }) => {
  return (
<div className="flex flex-col items-center p-6 rounded-[2rem] transition-colors duration-200 min-w-[160px] 
  bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
  shadow-xl shadow-slate-200/50 dark:shadow-none 
  border border-white/20 dark:border-gray-700/50"
>      
      {/* Icon Container with dynamic background opacity */}
      <div className={`p-3 mb-4 rounded-full bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="mb-2 text-sm font-bold text-center text-gray-800 break-words dark:text-white">
        {title}
      </h3>
      
      <p className="mb-4 text-xl font-extrabold text-gray-900 dark:text-gray-100">
        {fraction}
      </p>

      <CircularProgress percentage={percentage} colorClass={colorClass} />

      <p className="mt-4 text-xs font-medium text-gray-400 dark:text-gray-500">
        Last 24 Hours
      </p>
    </div>
  );
};

export default StatCard;