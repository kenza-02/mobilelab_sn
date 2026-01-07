import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const eventData = {
  id: "101",
  title: "Sommet de la Démocratie Participative",
  type: "PHYSIQUE", // ou "LIGNE"
  date: "Samedi 24 Jan. 2026",
  time: "09:00 - 17:00",
  locationName: "Place de l'Indépendance, Dakar",
  coordinates: {
    latitude: 14.6677,
    longitude: -17.4391,
  },
  speakers: [
    {
      name: "Dr. Amy Sall",
      role: "Urbaniste",
      photo: "https://i.pravatar.cc/150?u=1",
    },
    {
      name: "M. Bassirou Diop",
      role: "Médiateur",
      photo: "https://i.pravatar.cc/150?u=2",
    },
  ],
  description:
    "Rejoignez-nous pour une journée d'ateliers collaboratifs afin de dessiner le futur de notre ville. Au programme : design thinking, présentations de projets citoyens et networking.",
  imageUri:
    "https://img.freepik.com/free-photo/group-diverse-people-having-business-meeting_53876-25060.jpg",
};

const EventDetailScreen = () => {
  const { colors } = useTheme();

  const openInGoogleMaps = () => {
    const { latitude, longitude } = eventData.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=${eventData.locationName}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${eventData.locationName})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View
      style={[BaseStyles.mainContainer, { backgroundColor: colors.background }]}
    >
      <View style={BaseStyles.headerFloating}>
        <TouchableOpacity
          style={[BaseStyles.backCircle, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/evenements` as any)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.tint1} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: eventData.imageUri }}
          style={BaseStyles.heroImage}
        />

        <View
          style={[
            BaseStyles.contentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={[styles.typeBadge, { backgroundColor: colors.tint1 }]}>
            <Text style={[styles.typeText, { color: colors.tint2 }]}>
              {eventData.type}
            </Text>
          </View>

          <Text style={[BaseStyles.title, { color: colors.text }]}>
            {eventData.title}
          </Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar" size={20} color={colors.tint1} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {eventData.date}
              </Text>
              <Text style={[styles.infoSubText, { color: colors.text }]}>
                {eventData.time}
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="location" size={20} color={colors.tint1} />
              <Text
                style={[styles.infoText, { color: colors.text }]}
                numberOfLines={1}
              >
                Dakar
              </Text>
              <Text style={[styles.infoSubText, { color: colors.text }]}>
                Sénégal
              </Text>
            </View>
          </View>
          <Text style={[BaseStyles.sectionTitle, { color: colors.text }]}>
            Intervenants
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.speakersScroll}
          >
            {eventData.speakers.map((s, index) => (
              <View
                key={index}
                style={[styles.speakerItem, { backgroundColor: colors.card }]}
              >
                <Image source={{ uri: s.photo }} style={styles.speakerPhoto} />
                <View>
                  <Text style={[styles.speakerName, { color: colors.text }]}>
                    {s.name}
                  </Text>
                  <Text style={[styles.speakerRole, { color: colors.text }]}>
                    {s.role}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Text
            style={[
              BaseStyles.sectionTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            Détails
          </Text>
          <Text style={[BaseStyles.description, { color: colors.text }]}>
            {eventData.description}
          </Text>
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
      <View
        style={[
          BaseStyles.footerdetail,
          { backgroundColor: colors.background, borderTopColor: colors.card },
        ]}
      ></View>
    </View>
  );
};

const styles = StyleSheet.create({
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 15,
  },
  typeText: { fontSize: 11, fontWeight: "bold" },
  infoRow: { flexDirection: "row", gap: 15, marginBottom: 25 },
  infoCard: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  infoText: { fontSize: 13, fontWeight: "bold", marginTop: 8 },
  infoSubText: { fontSize: 11, opacity: 0.6 },
  speakersScroll: { marginBottom: 10, padding: 5 },
  speakerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    minWidth: 180,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  speakerPhoto: { width: 45, height: 45, borderRadius: 22, marginRight: 12 },
  speakerName: { fontSize: 14, fontWeight: "bold" },
  speakerRole: { fontSize: 12, opacity: 0.6 },
});

export default EventDetailScreen;
