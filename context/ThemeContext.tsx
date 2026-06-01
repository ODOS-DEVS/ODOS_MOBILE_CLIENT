import {
  THEME_STORAGE_KEY,
  darkTheme,
  lightTheme,
  type ThemeColors,
} from "@/constants/theme";
import * as SecureStore from "expo-secure-store";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StatusBar, type StatusBarStyle } from "react-native";

type ThemeContextValue = {
  isDark: boolean;
  darkMode: boolean;
  colors: ThemeColors;
  statusBarStyle: StatusBarStyle;
  isReady: boolean;
  setDarkMode: (enabled: boolean) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [darkMode, setDarkModeState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (mounted && stored != null) {
          setDarkModeState(stored === "1");
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark = darkMode;
  const colors = isDark ? darkTheme : lightTheme;
  const statusBarStyle: StatusBarStyle = isDark ? "light-content" : "dark-content";

  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    setDarkModeState(enabled);
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, enabled ? "1" : "0");
  }, []);

  const toggleDarkMode = useCallback(async () => {
    setDarkModeState((current) => {
      const next = !current;
      void SecureStore.setItemAsync(THEME_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isDark,
      darkMode,
      colors,
      statusBarStyle,
      isReady,
      setDarkMode,
      toggleDarkMode,
    }),
    [colors, darkMode, isDark, isReady, setDarkMode, statusBarStyle, toggleDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar barStyle={statusBarStyle} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
