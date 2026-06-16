'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    
    // Only update if the theme is different from what's already applied
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (currentTheme !== initialTheme) {
      updateDocumentTheme(initialTheme);
    }
  }, []);

  const updateDocumentTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add new theme class
    html.classList.add(newTheme);
    
    // Update data attribute for CSS selectors
    html.setAttribute('data-theme', newTheme);
    
    console.log(`Theme updated to: ${newTheme}`);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateDocumentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log(`Theme toggled to: ${newTheme}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-200
        ${theme === 'light' 
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
          : 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
        }
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <i className="fas fa-moon text-lg"></i>
      ) : (
        <i className="fas fa-sun text-lg"></i>
      )}
    </button>
  );
}
