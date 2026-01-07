import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
type Theme = "light" | "dark";
interface Colors {
  text: string;
  background: string;
  tint: string;
  tint1: string;
  tint2: string;
  borderLeftWidth: number;
  card: string;
}
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: Colors;
}

const lightColors: Colors = {
  background: "#F7F9FC",
  text: "#333333",
  tint: "#15803d",
  tint1: "#15803d",
  tint2: "#FFFFFF",
  borderLeftWidth: 0,
  card: "#FFFFFF",
};

// const darkColors: Colors = {
//   background: "#0A0A0A",
//   text: "#F0F0F0",
//   tint: "#15803d",
//   tint1: "#FFFFFF",
//   tint2: "#15803d",
//   card: "#15803d",
// };
const darkColors: Colors = {
  background: "#212121",
  text: "#F0F0F0",
  tint: "#15803d",
  tint1: "#FFFFFF",
  tint2: "#15803d",
  borderLeftWidth: 5,
  card: "rgba(255, 255, 255, 0.08)",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemTheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<Theme>(systemTheme || "light");

  const toggleTheme = () => {
    setUserTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const currentColors = useMemo(() => {
    return userTheme === "light" ? lightColors : darkColors;
  }, [userTheme]);

  const value = {
    theme: userTheme,
    toggleTheme,
    colors: currentColors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  }
  return context;
};
