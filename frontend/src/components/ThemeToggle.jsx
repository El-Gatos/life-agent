import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, SplitSquareHorizontal, MoonStar } from 'lucide-react'; // Adjust icons based on your library

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'midnight', icon: MoonStar, label: 'Midnight' },
    { id: 'split', icon: SplitSquareHorizontal, label: 'Split' },
  ];

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const CurrentIcon = themes.find(t => t.id === theme)?.icon || Sun;

  return (
    <button 
      onClick={cycleTheme}
      className="flex items-center gap-2 p-2 px-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
    >
      <CurrentIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
        {theme}
      </span>
    </button>
  );
};

export default ThemeToggle;