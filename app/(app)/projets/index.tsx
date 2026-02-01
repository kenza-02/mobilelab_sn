import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PROJECTS_DATA = [
  {
    id: "1",
    title: "Rénovation du Parc Central",
    category: "Environnement",
    description: "Aménagement d'espaces de jeux et plantation d'arbres natifs.",
    date: " 12 Jan. 2026",
    progress: 0.65, // 65%
    image:
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=500",
  },
  {
    id: "2",
    title: "Wifi Gratuit au Centre-Ville",
    category: "Technologie",
    description:
      "Installation de bornes Wi-Fi haut débit dans les zones publiques.",
    date: " 05 Mars 2026",
    progress: 0.3,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=500",
  },
  {
    id: "3",
    title: "Bibliothèque Solidaire",
    category: "Éducation",
    description:
      "Création d'un espace d'échange de livres géré par les citoyens.",
    date: "Terminé",
    progress: 1,
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=500",
  },
];

const ProjectsScreen = () => {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");

  const renderProjectCard = ({ item }: { item: (typeof PROJECTS_DATA)[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/projets/${item.id}` as any)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={[styles.categoryBadge, { backgroundColor: colors.tint2 }]}>
        <Text style={[styles.categoryText, { color: colors.tint1 }]}>
          {item.category}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.cardDescription, { color: colors.text, opacity: 0.7 }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.text}
              style={{ opacity: 0.6 }}
            />
            <Text
              style={[styles.dateText, { color: colors.text, opacity: 0.6 }]}
            >
              {" "}
              {item.date}
            </Text>
          </View>
          <Ionicons
            name="arrow-forward-circle"
            size={24}
            color={colors.tint1}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <View
        style={[BaseStyles.container, { backgroundColor: colors.background }]}
      >
        <View style={BaseStyles.contentWrapper}>
          <View style={BaseStyles.section}>
            <View style={BaseStyles.sectionHeader}>
              <Text style={[BaseStyles.sectionTitle, { color: colors.tint1 }]}>
                <Ionicons
                  name="folder-open-outline"
                  color={colors.tint1}
                  style={BaseStyles.marginRight}
                  size={24}
                />
                Nos projets
              </Text>
            </View>
            <FlatList
              data={PROJECTS_DATA}
              renderItem={renderProjectCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={BaseStyles.flatListContent}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 12,
    marginTop: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  categoryBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(150,150,150,0.2)",
    paddingTop: 10,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
  },
  allProjectsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 10,
    marginBottom: 30,
    gap: 10,
  },
  allProjectsText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProjectsScreen;
