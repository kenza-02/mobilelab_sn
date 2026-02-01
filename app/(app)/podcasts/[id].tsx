import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const podcastData = {
  id: "1",
  title: "L'avenir de l'écologie urbaine",
  author: "Jean Dupont",
  imageUri:
    "https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg",
  description:
    "Un échange passionnant sur les solutions durables pour nos villes.",
  fullContent:
    "Dans cet épisode spécial, nous recevons Jean Dupont, expert en urbanisme durable. Ensemble, nous décortiquons les stratégies de verdissement des métropoles mondiales et l'impact direct sur la santé des citoyens. De la gestion des eaux pluviales aux toitures végétalisées, découvrez comment la technologie et la nature s'allient pour créer l'habitat de demain.",
  date: "15 Déc. 2025",
  category: "PODCAST",
  duration: "18:42",
};

const PodcastDetailScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[BaseStyles.mainContainer, { backgroundColor: colors.background }]}
    >
      <View style={BaseStyles.headerFloating}>
        <TouchableOpacity
          style={[BaseStyles.backCircle, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/podcasts` as any)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.tint1} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: podcastData.imageUri }}
          style={BaseStyles.heroImage}
        />

        <View
          style={[
            BaseStyles.contentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={[BaseStyles.badge, { backgroundColor: colors.tint1 }]}>
            <Text style={[BaseStyles.badgeText, { color: colors.tint2 }]}>
              {podcastData.category}
            </Text>
          </View>
          <Text style={[BaseStyles.title, { color: colors.text }]}>
            {podcastData.title}
          </Text>
          <View style={BaseStyles.dateRow}>
            <Ionicons
              name="mic-outline"
              size={16}
              color={colors.text}
              style={{ opacity: 0.6 }}
            />
            <Text style={[BaseStyles.dateText, { color: colors.text }]}>
              {podcastData.author}
            </Text>
            <View style={[BaseStyles.dot, { backgroundColor: colors.tint1 }]} />
            <Text style={[BaseStyles.readTime, { color: colors.text }]}>
              {podcastData.duration} min
            </Text>
          </View>
          <Text
            style={[
              BaseStyles.fullContent,
              { color: colors.text, marginTop: 20, marginBottom: 20 },
            ]}
          >
            {podcastData.fullContent}
          </Text>
          <View
            style={[
              styles.playerBar,
              { backgroundColor: colors.card, borderTopColor: colors.tint1 },
            ]}
          >
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: colors.tint1 }]}
            >
              <Ionicons name="play" size={30} color={colors.tint2} />
            </TouchableOpacity>

            <View style={styles.playerInfo}>
              <Text
                style={[styles.playerTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                Lecture de l'épisode
              </Text>
              <Text style={[styles.playerSub, { color: colors.text }]}>
                {podcastData.duration} restant
              </Text>
            </View>

            {/* <TouchableOpacity style={styles.actionIcon}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color={colors.tint1}
              />
            </TouchableOpacity> */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  playerBar: {
    // position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 2,
    // elevation: 10,
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  playerSub: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionIcon: {
    padding: 10,
  },
});

export default PodcastDetailScreen;
