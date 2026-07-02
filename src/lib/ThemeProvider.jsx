import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  darkMode: false,
  setDarkMode: () => {},
  autoMode: true,
  setAutoMode: () => {},
});

export function ThemeProvider({ children }) {
  const [autoMode, setAutoModeState] = useState(() => {
    const saved = localStorage.getItem('themeAutoMode');
    return saved === null ? true : saved === 'true';
  });

  const [manualDarkMode, setManualDarkModeState] = useState(() => {
    const saved = localStorage.getItem('manualDarkMode');
    if (saved !== null) return saved === 'true';
    return false;
  });

  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  // Listen to system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setAutoMode = (value) => {
    setAutoModeState(value);
    localStorage.setItem('themeAutoMode', value.toString());
  };

  const setDarkMode = (value) => {
    setManualDarkModeState(value);
    localStorage.setItem('manualDarkMode', value.toString());
  };

  const darkMode = autoMode ? systemDark : manualDarkMode;

  // Apply to DOM
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, autoMode, setAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}