import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { theme } from "antd";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem("theme");

  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("theme", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme: () => {
        setMode((current) => (current === "light" ? "dark" : "light"));
      },
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export const getAntTheme = (mode: ThemeMode) => ({
  algorithm:
    mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,

  token: {
    fontFamily: "IRANYekan, sans-serif",

    ...(mode === "dark" && {
      colorBgLayout: "#20242c",
      colorBgContainer: "#292e38",
      colorBgElevated: "#292e38",

      colorBorder: "#4b5263",
      colorBorderSecondary: "#3b414e",
      colorSplit: "#3b414e",

      colorText: "#f1f3f5",
      colorTextSecondary: "#aeb4c0",
    }),
  },
});