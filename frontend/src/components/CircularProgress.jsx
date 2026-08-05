import React from 'react';

const CircularProgress = ({ percentage, colorClass }) => {
  // SVG math to calculate the stroke length
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Track */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-100 dark:text-gray-700 transition-colors duration-200"
        />
        {/* Actual Progress Ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-in-out`}
        />
      </svg>
      {/* Centered Percentage Text */}
      <span className="absolute text-lg font-bold text-gray-700 dark:text-gray-200">
        {percentage}%
      </span>
    </div>
  );
};

export default CircularProgress;