import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { HeaderRightIcons } from "./HeaderRightIcons";

const BOTTOM_RADIUS = 20;

export const CustomHeader = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.tint }]}>
      {/* 1. Zone Titre/Logo (Aligné à gauche comme par défaut) */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: "#fff" }]}>
          Citizenlab Senegal
        </Text>
      </View>

      {/* 2. Zone d'Icônes (Alignée à droite) */}
      <HeaderRightIcons />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 20 : 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomLeftRadius: BOTTOM_RADIUS,
    borderBottomRightRadius: BOTTOM_RADIUS,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  titleContainer: {
    paddingLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
