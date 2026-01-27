import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

const ICON_COLOR = "#fff";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const iconName = theme === "light" ? "moon-outline" : "sunny-outline";

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Ionicons name={iconName as any} size={22} color={ICON_COLOR} />
    </TouchableOpacity>
  );
};
