import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { QuickAccessButton } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const sliderData = [
  {
    id: "s1",
    title: "Collecte de fonds pour le nouveau projet",
    date: "15 Déc. 2025",
    image:
      "https://img.freepik.com/premium-photo/group-people-are-raising-their-hands-air_1040878-4204.jpg?w=2000",
  },
  {
    id: "s2",
    title: "Atelier de la communauté la semaine prochaine",
    date: "20 Déc. 2025",
    image:
      "https://img.freepik.com/premium-photo/large-room-with-large-audience-middle-it_1286196-1335.jpg",
  },
  {
    id: "s3",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/premium-photo/group-business-people-participating-panel-discussion_53876-53632.jpg",
  },
  {
    id: "s4",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/free-vector/different-multicolored-microphones_1284-17119.jpg",
  },
  {
    id: "s5",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/premium-photo/group-international-delegates-are-showing-symbol-peace-environment_53876-9961.jpg",
  },
  {
    id: "s6",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/free-photo/healthcare-concept-clinic_23-2151117903.jpg",
  },
  {
    id: "s7",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/premium-photo/group-business-people-participating-panel-discussion_53876-53632.jpg",
  },
  {
    id: "s8",
    title: "Nouvelle loi sur l'engagement citoyen",
    date: "01 Jan. 2026",
    image:
      "https://img.freepik.com/premium-photo/group-business-people-participating-panel-discussion_53876-53632.jpg",
  },
];

const quickAccessButtons: QuickAccessButton[] = [
  {
    id: "b1",
    title: "Projets",
    targetPath: "/projets",
    iconName: "folder-open-outline",
  },
  {
    id: "b2",
    title: "Événements",
    targetPath: "/evenements",
    iconName: "calendar-outline",
  },
  {
    id: "b3",
    title: "Communautés",
    targetPath: "/equipe",
    iconName: "people-outline",
  },
  {
    id: "b5",
    title: "Documents",
    targetPath: "/documents",
    iconName: "document-text-outline",
  },
];
const podcastData = [
  {
    id: "p1",
    title: "L'impact du numérique",
    host: "Jean Dupont",
    duration: "15 min",
    image:
      "https://img.freepik.com/free-photo/pov-man-woman-recording-live-discussion-camera-doing-podcast-episode-together-lifestyle-influencer-talking-female-guest-studio-with-rpg-neon-lights-equipment_482257-48353.jpg",
  },
  {
    id: "p2",
    title: "Demain la cité",
    host: "Marie Curie",
    duration: "22 min",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=500",
  },
  {
    id: "p3",
    title: "Demain la cité",
    host: "Marie Curie",
    duration: "22 min",
    image:
      "https://img.freepik.com/free-photo/side-view-radio-microphone-with-copy-space_23-2148808737.jpg",
  },
  {
    id: "p4",
    title: "Demain la cité",
    host: "Marie Curie",
    duration: "22 min",
    image:
      "https://img.freepik.com/free-photo/diverse-team-people-meeting-stream-podcast-episode-together-creating-online-content-with-live-broadcast-discussion-male-vlogger-talking-adult-livestream-production_482257-45803.jpg",
  },
];

interface SliderItemProps {
  item: (typeof sliderData)[0];
}

const SliderItem: React.FC<SliderItemProps> = ({ item }) => (
  <TouchableOpacity
    style={BaseStyles.sliderItem}
    onPress={() => router.push(`/actualites/${item.id}` as any)}
  >
    <View style={BaseStyles.imageContainer}>
      <Image
        source={{ uri: item.image }}
        style={BaseStyles.sliderImage}
        resizeMode="cover"
      />
      <View style={BaseStyles.textOverlay} />

      <View style={BaseStyles.textContainer}>
        <Text style={BaseStyles.sliderDate}>🗓️ {item.date}</Text>
        <Text style={BaseStyles.sliderTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface QuickButtonProps {
  button: QuickAccessButton;
  onPress: () => void;
  primaryColor: string;
  textColor: string;
  cardBackgroundColor: string;
}

const QuickButton: React.FC<QuickButtonProps> = ({
  button,
  onPress,
  primaryColor,
  textColor,
  cardBackgroundColor,
}) => (
  <TouchableOpacity
    style={[
      BaseStyles.quickButton,
      { borderLeftColor: primaryColor, backgroundColor: cardBackgroundColor },
    ]}
    onPress={onPress}
  >
    <View style={BaseStyles.iconContainer}>
      <Ionicons name={button.iconName as any} size={30} color={primaryColor} />
    </View>
    <Text style={[BaseStyles.quickButtonText, { color: textColor }]}>
      {button.title}
    </Text>
  </TouchableOpacity>
);
const PodcastCard = ({ item, colors }: { item: any; colors: any }) => (
  <TouchableOpacity
    style={{
      width: 160,
      marginRight: 15,
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: "hidden",
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border || "#eee",
    }}
    onPress={() => router.push(`/podcasts/${item.id}` as any)}
  >
    <View style={{ position: "relative" }}>
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: 120, borderRadius: 15 }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          backgroundColor: colors.tint1,
          borderRadius: 20,
          padding: 5,
        }}
      >
        <Ionicons name="play" size={18} color={colors.tint2} />
      </View>
    </View>

    <Text
      style={{
        color: colors.text,
        fontWeight: "bold",
        marginTop: 10,
        fontSize: 14,
      }}
      numberOfLines={1}
    >
      {item.title}
    </Text>
    <Text
      style={{
        color: colors.text,
        opacity: 0.6,
        fontSize: 12,
        marginTop: 4,
      }}
    >
      {item.duration} • {item.host}
    </Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const renderSliderItem = ({ item }: { item: (typeof sliderData)[0] }) => (
    <SliderItem item={item} />
  );

  const handleButtonPress = (path: string) => {
    // @ts-ignore
    router.push(path);
  };

  const handleViewAllNews = () => {
    // @ts-ignore
    router.push("/actualites");
  };
  const handleViewAllPodcast = () => {
    // @ts-ignore
    router.push("/podcasts");
  };

  return (
    <ScrollView
      style={[BaseStyles.container, { backgroundColor: colors.background }]}
    >
      <View style={BaseStyles.contentWrapper}>
        <View style={BaseStyles.section}>
          <View style={BaseStyles.sectionHeader}>
            <Text style={[BaseStyles.sectionTitle, { color: colors.tint1 }]}>
              Actualités
            </Text>
            <TouchableOpacity
              onPress={handleViewAllNews}
              style={[
                BaseStyles.viewAllButton,
                { backgroundColor: colors.tint1 },
              ]}
            >
              <Text
                style={[BaseStyles.viewAllButtonText, { color: colors.tint2 }]}
              >
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sliderData}
            renderItem={renderSliderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            // snapToInterval={BaseStyles.SLIDER_ITEM_WIDTH + 10}
            decelerationRate="fast"
            contentContainerStyle={BaseStyles.sliderContainer}
          />
        </View>
        <View style={BaseStyles.section}>
          <View style={BaseStyles.sectionHeader}>
            <Text style={[BaseStyles.sectionTitle, { color: colors.tint1 }]}>
              Podcasts récents
            </Text>
            <TouchableOpacity
              onPress={handleViewAllPodcast}
              style={[
                BaseStyles.viewAllButton,
                { backgroundColor: colors.tint1 },
              ]}
            >
              <Text
                style={[BaseStyles.viewAllButtonText, { color: colors.tint2 }]}
              >
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={podcastData}
            renderItem={({ item }) => (
              <PodcastCard item={item} colors={colors} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={BaseStyles.sliderContainer}
          />
        </View>
        <View style={BaseStyles.section}>
          <View style={BaseStyles.sectionHeader}>
            <Text style={[BaseStyles.sectionTitle, { color: colors.tint1 }]}>
              Accès rapide
            </Text>
          </View>
          <View style={BaseStyles.quickButtonGrid}>
            {quickAccessButtons.map((button) => (
              <QuickButton
                key={button.id}
                button={button}
                onPress={() => handleButtonPress(button.targetPath)}
                primaryColor={colors.tint1}
                textColor={colors.text}
                cardBackgroundColor={colors.card}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
