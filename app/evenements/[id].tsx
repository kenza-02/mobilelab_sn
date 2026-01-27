import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { getEvenementById } from "@/services/evenementService";
import { Evenement } from "@/types/evenement";

const { width } = Dimensions.get("window");

const EventDetailScreen = () => {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvenement = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getEvenementById(Number(id));
          setEvenement(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvenement();
  }, [id]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const openInGoogleMaps = () => {
    if (!evenement || !evenement.lieu) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${evenement.lieu}`,
      android: `geo:0,0?q=${evenement.lieu}`,
    });
    if (url) Linking.openURL(url);
  };

  const openLink = () => {
    if (evenement?.lien) {
      Linking.openURL(evenement.lien);
    }
  };

  if (loading) {
    return (
      <View style={[BaseStyles.mainContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint1} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement de l'événement...
        </Text>
      </View>
    );
  }

  if (!evenement) {
    return (
      <View style={[BaseStyles.mainContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.text} style={{ opacity: 0.3 }} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Événement introuvable
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.tint1 }]}
          onPress={() => router.push('/evenements' as any)}
        >
          <Text style={[styles.backButtonText, { color: colors.tint2 }]}>
            Retour aux événements
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const defaultImage = "https://img.freepik.com/free-photo/group-diverse-people-having-business-meeting_53876-25060.jpg";
  const imageUri = evenement.image 
    ? `http://127.0.0.1:8000/storage/${evenement.image}` 
    : defaultImage;

  return (
    <View
      style={[BaseStyles.mainContainer, { backgroundColor: colors.background }]}
    >
      <View style={BaseStyles.headerFloating}>
        <TouchableOpacity
          style={[BaseStyles.backCircle, { backgroundColor: colors.card }]}
          onPress={() => router.push('/evenements' as any)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.tint1} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: imageUri }}
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
              {evenement.type?.toUpperCase() || 'ÉVÉNEMENT'}
            </Text>
          </View>

          <Text style={[BaseStyles.title, { color: colors.text }]}>
            {evenement.libelle}
          </Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar" size={20} color={colors.tint1} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatDate(evenement.date_debut)}
              </Text>
              <Text style={[styles.infoSubText, { color: colors.text }]}>
                {evenement.heure_debut} - {evenement.heure_fin}
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Ionicons name={evenement.lieu ? "location" : "link"} size={20} color={colors.tint1} />
              <Text
                style={[styles.infoText, { color: colors.text }]}
                numberOfLines={1}
              >
                {evenement.lieu ? 'Présentiel' : 'En ligne'}
              </Text>
              {evenement.lieu ? (
                <TouchableOpacity onPress={openInGoogleMaps}>
                  <Text style={[styles.infoSubText, { color: colors.tint1, textDecorationLine: 'underline' }]}>
                    Voir sur Maps
                  </Text>
                </TouchableOpacity>
              ) : evenement.lien ? (
                <TouchableOpacity onPress={openLink}>
                  <Text style={[styles.infoSubText, { color: colors.tint1, textDecorationLine: 'underline' }]}>
                    Rejoindre
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {evenement.intervenants && evenement.intervenants.length > 0 && (
            <>
              <Text style={[BaseStyles.sectionTitle, { color: colors.text }]}>
                Intervenants
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.speakersScroll}
              >
                {evenement.intervenants.map((intervenant, index) => (
                  <View
                    key={index}
                    style={[styles.speakerItem, { backgroundColor: colors.card }]}
                  >
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint1 }]}>
                      <Text style={[styles.avatarText, { color: colors.tint2 }]}>
                        {intervenant.prenom?.charAt(0)}{intervenant.nom?.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.speakerName, { color: colors.text }]}>
                        {intervenant.prenom} {intervenant.nom}
                      </Text>
                      <Text style={[styles.speakerRole, { color: colors.text }]}>
                        {intervenant.sexe}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <Text
            style={[
              BaseStyles.sectionTitle,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            Détails
          </Text>
          <Text style={[BaseStyles.description, { color: colors.text }]}>
            {evenement.description || 'Aucune description disponible.'}
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
  infoText: { fontSize: 13, fontWeight: "bold", marginTop: 8, textAlign: 'center' },
  infoSubText: { fontSize: 11, opacity: 0.6, marginTop: 4, textAlign: 'center' },
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
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakerName: { fontSize: 14, fontWeight: "bold" },
  speakerRole: { fontSize: 12, opacity: 0.6 },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetailScreen;
