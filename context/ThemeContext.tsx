import {
  THEME_PREFERENCE_KEY,
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
import { Appearance, StatusBar, type StatusBarStyle } from "react-native";

type ThemePreference = "system" | "light" | "dark";

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

function resolveDarkMode(preference: ThemePreference) {
  if (preference === "dark") {
    return true;
  }
  if (preference === "light") {
    return false;
  }
  return Appearance.getColorScheme() === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [darkMode, setDarkModeState] = useState(() => resolveDarkMode("system"));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const storedPreference = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
        const legacyStored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);

        if (mounted) {
          if (storedPreference === "light" || storedPreference === "dark") {
            setPreference(storedPreference);
            setDarkModeState(storedPreference === "dark");
          } else if (legacyStored != null) {
            const legacyDark = legacyStored === "1";
            setPreference(legacyDark ? "dark" : "light");
            setDarkModeState(legacyDark);
          } else {
            setPreference("system");
            setDarkModeState(resolveDarkMode("system"));
          }
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

  useEffect(() => {
    if (preference !== "system") {
      return;
    }

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkModeState(colorScheme === "dark");
    });

    return () => {
      subscription.remove();
    };
  }, [preference]);

  const isDark = darkMode;
  const colors = isDark ? darkTheme : lightTheme;
  const statusBarStyle: StatusBarStyle = isDark ? "light-content" : "dark-content";

  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);

  const persistPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    setDarkModeState(resolveDarkMode(nextPreference));
    await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, nextPreference);
    await SecureStore.setItemAsync(
      THEME_STORAGE_KEY,
      resolveDarkMode(nextPreference) ? "1" : "0",
    );
  }, []);

  const setDarkMode = useCallback(
    async (enabled: boolean) => {
      await persistPreference(enabled ? "dark" : "light");
    },
    [persistPreference],
  );

  const toggleDarkMode = useCallback(async () => {
    await setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

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
