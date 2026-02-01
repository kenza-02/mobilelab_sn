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

const podcastData = [
  {
    id: "1",
    title: "L'avenir de l'écologie urbaine",
    author: "Jean Dupont",
    imageUri:
      "https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg",
    duration: "12:45",
    category: "Environnement",
  },
  {
    id: "2",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "3",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "4",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "5",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "6",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "7",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
  {
    id: "8",
    title: "Éducation : les nouveaux défis",
    author: "Marie Curie",
    imageUri:
      "https://img.freepik.com/free-photo/focused-woman-testing-vr-headset_74855-4231.jpg",
    duration: "24:10",
    category: "Société",
  },
];

const PodcastScreen: React.FC = () => {
  const { colors } = useTheme();

  const renderPodcastItem = ({ item }: { item: (typeof podcastData)[0] }) => (
    <TouchableOpacity
      style={[styles.podcastCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/podcasts/${item.id}` as any)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUri }} style={styles.podcastImage} />
        <View
          style={[styles.playOverlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}
        >
          <Ionicons name="play" size={24} color="#FFF" />
        </View>
      </View>
      <View style={styles.podcastContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.categoryText, { color: colors.tint1 }]}>
            {item.category}
          </Text>
          <Text style={[styles.durationText, { color: colors.text }]}>
            {item.duration}
          </Text>
        </View>

        <Text
          style={[styles.podcastTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <View style={styles.authorRow}>
          <Ionicons
            name="mic-outline"
            size={14}
            color={colors.text}
            style={{ opacity: 0.6, marginRight: 4 }}
          />
          <Text style={[styles.podcastAuthor, { color: colors.text }]}>
            {item.author}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.tint1}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={BaseStyles.container}>
        <View style={BaseStyles.contentWrapper}>
          <View style={BaseStyles.section}>
            <View style={BaseStyles.sectionHeader}>
              <Text style={[BaseStyles.sectionTitle, { color: colors.tint1 }]}>
                <Ionicons
                  name="headset-outline"
                  size={22}
                  color={colors.tint1}
                />
                Podcasts
              </Text>
            </View>

            <FlatList
              data={podcastData}
              renderItem={renderPodcastItem}
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
  podcastCard: {
    flexDirection: "row",
    borderRadius: 20,
    marginBottom: 16,
    padding: 10,
    alignItems: "center",
    // Suppression des bordures pour un look plus "flat modern"
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  imageContainer: {
    position: "relative",
    width: 90,
    height: 90,
  },
  podcastImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  podcastContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 11,
    opacity: 0.5,
    fontWeight: "600",
  },
  podcastTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 6,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  podcastAuthor: {
    fontSize: 13,
    opacity: 0.6,
  },
});

export default PodcastScreen;
