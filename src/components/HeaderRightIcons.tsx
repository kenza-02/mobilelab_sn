import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemeToggle } from "./ThemeToggle";
const ICON_COLOR = "#fff";

export const HeaderRightIcons = () => {
  const router = useRouter();

  const handlePress = (target: string) => {
    switch (target) {
      case "index":
        // @ts-ignore
        router.push("/");
        break;
      case "admin":
        // @ts-ignore
        router.push("/admin");
        break;
      default:
        Alert.alert("Action", `Icône ${target} cliquée.`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handlePress("index")}
        style={styles.iconButton}
      >
        <Ionicons name="home-outline" size={22} color={ICON_COLOR} />
        {/* <TouchableOpacity
        onPress={() => handlePress("menu")}
        style={styles.iconButton}
      >
        <Ionicons name="menu" size={24} color={ICON_COLOR} />
      </TouchableOpacity> */}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress("admin")}
        style={styles.iconButton}
      >
        <Ionicons name="log-in-outline" size={24} color={ICON_COLOR} />
      </TouchableOpacity>
      <View style={styles.iconButton}>
        <ThemeToggle />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 15,
  },
  iconButton: {
    marginLeft: 15,
  },
});
