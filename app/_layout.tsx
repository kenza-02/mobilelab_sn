import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { Stack } from "expo-router";
import React from "react";
import { HeaderRightIcons } from "../src/components/HeaderRightIcons";

const ThemedStack = () => {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.tint,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitle: "Citizenlab Senegal",
        headerRight: () => <HeaderRightIcons />,
        headerLeft: () => null,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />

      <Stack.Screen
        name="actualites/index"
        options={{
          title: "Actualités",
        }}
      />
      <Stack.Screen
        name="actualites/[id]"
        options={{
          title: "Detail actualités",
        }}
      />
      <Stack.Screen
        name="equipe"
        options={{
          title: "Equipe",
        }}
      />
      <Stack.Screen name="projets/index" options={{ title: "Projets" }} />
      <Stack.Screen name="podcasts/index" options={{ title: "Podcasts" }} />
      <Stack.Screen name="evenements/index" options={{ title: "Evenements" }} />
      <Stack.Screen name="documents" options={{ title: "Ressources" }} />
      <Stack.Screen name="parametres" options={{ title: "Paramètres" }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
