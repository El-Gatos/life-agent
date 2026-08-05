import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage first, default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    // Strip out all our custom theme classes so they don't stack
    root.classList.remove('light', 'dark', 'theme-midnight', 'theme-split');
    
    // Add the active one
    root.classList.add(theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : `theme-${theme}`);
    
    // Save to local storage so it remembers when you refresh
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);