import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark'); // Defaulting to dark

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'theme-midnight', 'theme-split');
    
    // If it's anything other than light, we need Tailwind's dark classes to apply to the UI cards
    if (theme !== 'light') {
      root.classList.add('dark');
    }
    
    // Add the specific custom theme background class
    root.classList.add(`theme-${theme}`);
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);