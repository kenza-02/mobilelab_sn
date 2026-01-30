import { useTheme } from "@/hooks/useTheme";
import { getEvenements } from "@/services/evenementService";
import { BaseStyles } from "@/styles/BaseStyles";
import { Evenement } from "@/types/evenement";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BASE_URL } from "@/config/api";

const AllEventsScreen = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("A venir");
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les événements depuis l'API
  const loadEvenements = async () => {
    try {
      setLoading(true);
      const data = await getEvenements();
      setEvenements(data);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les événements au montage du composant
  useFocusEffect(
    useCallback(() => {
      loadEvenements();
    }, []),
  );

  // Fonction pour rafraîchir
  const onRefresh = () => {
    setRefreshing(true);
    loadEvenements();
  };

  // Filtrer les événements selon l'onglet actif
  const filteredEvents = evenements.filter((event) => {
    const eventDate = new Date(event.date_debut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activeTab === "A venir" ? eventDate >= today : eventDate < today;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("fr-FR", { month: "short" });
    return { day: day.toString(), month: month };
  };

  const renderEventItem = ({ item }: { item: Evenement }) => {
    const { day, month } = formatDate(item.date_debut);
    const defaultImage =
      "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=500";

    return (
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/evenements/${item.id}` as any)}
      >
        <Image
          source={{
            uri: item.image
              ? `${BASE_URL}/storage/${item.image}`
              : defaultImage,
          }}
          style={styles.eventImage}
        />
        <View
          style={[styles.dateBadge, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.dateText, { color: colors.tint1 }]}>{day}</Text>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {month}
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
              {item.type?.toUpperCase() || "ÉVÉNEMENT"}
            </Text>
            <Text style={[styles.timeText, { color: colors.text }]}>
              <Ionicons name="time-outline" size={14} color={colors.tint1} />{" "}
              {item.heure_debut || "00:00"}
            </Text>
          </View>

          <Text
            style={[styles.eventTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.libelle}
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
              {item.lieu || item.lien || "Non spécifié"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          BaseStyles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint1} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement des événements...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.tint1]}
        />
      }
    >
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

            {/* Onglets */}
            <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "A venir" && { backgroundColor: colors.tint1 },
                ]}
                onPress={() => setActiveTab("A venir")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color:
                        activeTab === "A venir" ? colors.tint2 : colors.text,
                    },
                  ]}
                >
                  À venir ({filteredEvents.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "Passés" && { backgroundColor: colors.tint1 },
                ]}
                onPress={() => setActiveTab("Passés")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color:
                        activeTab === "Passés" ? colors.tint2 : colors.text,
                    },
                  ]}
                >
                  Passés (
                  {
                    evenements.filter((e) => {
                      const eventDate = new Date(e.date_debut);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return eventDate < today;
                    }).length
                  }
                  )
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id!.toString()}
              contentContainerStyle={BaseStyles.flatListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={60}
                    color={colors.text}
                    style={{ opacity: 0.3 }}
                  />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {activeTab === "A venir"
                      ? "Aucun événement à venir pour le moment."
                      : "Aucun événement passé."}
                  </Text>
                </View>
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.5,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    opacity: 0.7,
  },
});

export default AllEventsScreen;
