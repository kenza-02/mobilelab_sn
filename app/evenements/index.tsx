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

const ALL_EVENTS = [
  {
    id: "1",
    title: "Atelier Design Thinking",
    date: "24 Jan.",
    time: "10:00",
    location: "Dakar Plateau",
    type: "PHYSIQUE",
    image:
      "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=500",
    isPast: false,
  },
  {
    id: "2",
    title: "Webinaire : Économie Verte",
    date: "02 Fév.",
    time: "15:30",
    location: "En ligne (Zoom)",
    type: "LIGNE",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=500",
    isPast: false,
  },
  {
    id: "3",
    title: "Nettoyage de la Plage",
    date: "12 Déc.",
    time: "08:00",
    location: "Ngor",
    type: "PHYSIQUE",
    image:
      "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=500",
    isPast: true,
  },
];

const AllEventsScreen = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("A venir");

  const filteredEvents = ALL_EVENTS.filter((event) =>
    activeTab === "A venir" ? !event.isPast : event.isPast
  );

  const renderEventItem = ({ item }: { item: (typeof ALL_EVENTS)[0] }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/evenements/${item.id}` as any)}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={[styles.dateBadge, { backgroundColor: colors.background }]}>
        <Text style={[styles.dateText, { color: colors.tint1 }]}>
          {item.date.split(" ")[0]}
        </Text>
        <Text style={[styles.monthText, { color: colors.text }]}>
          {item.date.split(" ")[1]}
        </Text>
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.typeRow}>
          <Text
            style={[
              styles.typeText,
              { color: colors.tint2, backgroundColor: colors.tint1 },
            ]}
          >
            {item.type}
          </Text>
          <Text style={[styles.timeText, { color: colors.text }]}>
            <Ionicons name="time-outline" size={14} color={colors.tint1} />{" "}
            {item.time}
          </Text>
        </View>

        <Text
          style={[styles.eventTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.text}
            style={{ opacity: 0.6 }}
          />
          <Text
            style={[styles.locationText, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.location}
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
                  name="calendar-outline"
                  color={colors.tint1}
                  style={BaseStyles.marginRight}
                  size={20}
                />
                Nos Événements
              </Text>
            </View>
            <FlatList
              data={ALL_EVENTS}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={BaseStyles.flatListContent}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Aucun événement pour le moment.
                </Text>
              }
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 20, marginTop: 10 },
  subtitle: { fontSize: 14, opacity: 0.6, marginTop: 5 },
  tabBar: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 15,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabLabel: { fontSize: 14, fontWeight: "bold" },
  listContent: { paddingBottom: 100 },
  eventCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  dateBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 50,
    elevation: 5,
  },
  dateText: { fontSize: 16, fontWeight: "bold" },
  monthText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardInfo: { padding: 15 },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  timeText: { fontSize: 12, fontWeight: "600" },
  eventTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationText: { fontSize: 13, opacity: 0.6 },
  emptyText: { textAlign: "center", marginTop: 50, opacity: 0.5 },
});

export default AllEventsScreen;
