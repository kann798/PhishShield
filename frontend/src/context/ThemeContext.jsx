import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('phishshield_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to the Apple Liquid Glass Dark theme
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('dark', 'light');
    body.classList.remove('light-mode', 'dark-mode');

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark-mode');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      body.classList.add('light-mode');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('phishshield_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark', isSerene: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
