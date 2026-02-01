import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const allNewsData = [
  {
    id: "1",
    title: "Projet de verdissment urbain",
    imageUri:
      "https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg",
    description:
      "Une initiative locale visant à transformer les espaces urbains en zones vertes.",
    date: "15 Déc. 2025",
  },
  {
    id: "2",
    title: "Forum communautaire sur l'éducation",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    description:
      "Discussion sur les défis et solutions pour améliorer l'accès à l'éducation dans la communauté.",
    date: "20 Déc. 2025",
  },
  {
    id: "3",
    title: "Campagne de crowdfunding pour l'environnement",
    imageUri:
      "https://img.freepik.com/free-photo/standard-quality-control-concept-m_23-2150041859.jpg",
    description:
      "Collecte de fonds pour soutenir des projets de nettoyage et de sensibilisation écologique.",
    date: "31 Oct. 2025",
  },
  {
    id: "4",
    title: "Atelier de développement de compétences numériques",
    imageUri:
      "https://img.freepik.com/free-photo/ai-nuclear-energy-background-future-innovation-disruptive-technology_53876-129783.jpg",
    description:
      "Formation gratuite pour les jeunes afin d'acquérir des compétences essentielles pour le marché du travail.",
    date: "05 Sept. 2025",
  },
  {
    id: "5",
    title: "Rencontre avec les élus locaux",
    imageUri:
      "https://img.freepik.com/free-photo/server-room-colleagues-use-artificial-intelligence-perform-computing-tasks_482257-125053.jpg",
    description:
      "Échanges constructifs sur les besoins de la population et les projets futurs.",
    date: "10 Août. 2025",
  },
];

const AllNewsScreen: React.FC = () => {
  const { colors, theme } = useTheme();

  const renderNewsItem = ({ item }: { item: (typeof allNewsData)[0] }) => (
    <TouchableOpacity
      style={[
        styles.newsCard,
        {
          backgroundColor: colors.card,
          borderLeftColor: colors.tint2,
          borderLeftWidth: colors.borderLeftWidth,
        },
      ]}
      onPress={() => router.push(`/actualites/${item.id}` as any)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={[styles.newsDate, { color: colors.text }]}>
          <Ionicons name="calendar-outline" size={14} color={colors.text} />{" "}
          {item.date}
        </Text>
        <Text style={[styles.newsTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.newsDescription, { color: colors.text }]}>
          {item.description}
        </Text>
        <View
          style={[styles.readMoreButton, { backgroundColor: colors.tint1 }]}
        >
          <Text style={[styles.readMoreButtonText, { color: colors.tint2 }]}>
            Lire la suite
          </Text>
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
                  name="list-outline"
                  color={colors.tint1}
                  style={BaseStyles.marginRight}
                  size={20}
                />
                Les Actualités
              </Text>
            </View>
            <FlatList
              data={allNewsData}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={BaseStyles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: -30,
  },
  newsCard: {
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  newsImage: {
    width: "100%",
    height: 180,
    // resizeMode: "cover",
  },
  newsContent: {
    padding: 15,
  },
  newsDate: {
    fontSize: 13,
    marginBottom: 5,
    opacity: 0.8,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  readMoreButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AllNewsScreen;
