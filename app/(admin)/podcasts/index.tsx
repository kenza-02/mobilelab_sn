import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as ExpoAudio from "expo-av";

type Podcast = {
  id: number;
  libelle: string;
  description: string;
  fichier: string;
  created_at: string;
  updated_at: string;
  membre: {
    id: number;
    nom: string;
    prenom: string;
  };
  categorie: {
    id: number;
    nom?: string;
    libelle?: string;
  };
};

const { width } = Dimensions.get("window");

export default function PodcastList() {
  const API_BASE_URL = "https://destined-amal-lispily.ngrok-free.dev/api";

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const mobileAudioRef = useRef<ExpoAudio.Audio.Sound | null>(null);

  const getHeaders = () => ({
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  // Initialisation audio
  useEffect(() => {
    if (Platform.OS === "web") {
      // ✅ Utilise le Audio natif du navigateur (HTMLAudioElement)
      webAudioRef.current = new window.Audio();
      webAudioRef.current.onplay = () => setIsPlaying(true);
      webAudioRef.current.onpause = () => setIsPlaying(false);
      webAudioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentPodcast(null);
      };
    } else {
      // ✅ Utilise expo-av pour mobile
      ExpoAudio.Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });
    }

    return () => {
      if (Platform.OS === "web") {
        webAudioRef.current?.pause();
      } else {
        mobileAudioRef.current?.unloadAsync();
      }
    };
  }, []);

  const fetchPodcasts = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch(`${API_BASE_URL}/podcasts`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) throw new Error(`Erreur: ${response.status}`);

      const json = await response.json();
      setPodcasts(json.data ?? json);
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Impossible de charger les podcasts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPodcasts(false);
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPodcasts(false);
  };

  // ==================== LECTURE AUDIO ====================

  const playAudio = async (podcast: Podcast) => {
    setIsLoadingAudio(true);
    setCurrentPodcast(podcast);

    try {
      if (Platform.OS === "web") {
        if (webAudioRef.current) {
          webAudioRef.current.src = podcast.fichier;
          await webAudioRef.current.play();
        }
      } else {
        // ✅ Utilise ExpoAudio au lieu de Audio
        if (mobileAudioRef.current) {
          await mobileAudioRef.current.unloadAsync();
        }

        const { sound } = await ExpoAudio.Audio.Sound.createAsync(
          { uri: podcast.fichier },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setCurrentPodcast(null);
              }
            }
          },
        );

        mobileAudioRef.current = sound;
      }

      setIsPlaying(true);
    } catch (error) {
      console.error("Erreur lecture:", error);
      Alert.alert("Erreur", "Impossible de lire ce podcast");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (Platform.OS === "web") {
        if (webAudioRef.current) {
          if (isPlaying) {
            webAudioRef.current.pause();
          } else {
            await webAudioRef.current.play();
          }
        }
      } else {
        if (mobileAudioRef.current) {
          if (isPlaying) {
            await mobileAudioRef.current.pauseAsync();
          } else {
            await mobileAudioRef.current.playAsync();
          }
        }
      }
    } catch (error) {
      console.error("Erreur toggle:", error);
    }
  };

  const stopAudio = async () => {
    try {
      if (Platform.OS === "web") {
        if (webAudioRef.current) {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
        }
      } else {
        if (mobileAudioRef.current) {
          await mobileAudioRef.current.stopAsync();
          await mobileAudioRef.current.unloadAsync();
          mobileAudioRef.current = null;
        }
      }
    } catch (error) {
      console.error("Erreur stop:", error);
    }

    setIsPlaying(false);
    setCurrentPodcast(null);
  };

  const handlePlay = async (podcast: Podcast) => {
    if (currentPodcast?.id === podcast.id) {
      await togglePlayPause();
      return;
    }

    await stopAudio();
    await playAudio(podcast);
  };

  // ==================== ACTIONS ====================

  const handleDelete = (podcast: Podcast) => {
    Alert.alert("Supprimer", `Supprimer "${podcast.libelle}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            if (currentPodcast?.id === podcast.id) await stopAudio();

            await fetch(`${API_BASE_URL}/podcasts/${podcast.id}`, {
              method: "DELETE",
              headers: getHeaders(),
            });

            setPodcasts((prev) => prev.filter((p) => p.id !== podcast.id));
            setShowDetails(false);
            Alert.alert("Succès", "Podcast supprimé");
          } catch (error) {
            Alert.alert("Erreur", "Impossible de supprimer");
          }
        },
      },
    ]);
  };

  const openDetails = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedPodcast(null);
  };

  const filtered = podcasts.filter((p) => {
    const membreNom = p.membre ? `${p.membre.prenom} ${p.membre.nom}` : "";
    const categorieNom = p.categorie?.nom || p.categorie?.libelle || "";
    return `${p.libelle} ${membreNom} ${categorieNom}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== MODAL DÉTAILS ====================

  const PodcastDetails = () => {
    if (!selectedPodcast) return null;

    const membreNom = selectedPodcast.membre
      ? `${selectedPodcast.membre.prenom} ${selectedPodcast.membre.nom}`
      : "Inconnu";
    const categorieNom =
      selectedPodcast.categorie?.nom ||
      selectedPodcast.categorie?.libelle ||
      "Non catégorisé";
    const isActive = currentPodcast?.id === selectedPodcast.id;
    const isItemPlaying = isActive && isPlaying;

    return (
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeDetails} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Détails du podcast</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Artwork */}
              <View style={styles.detailsArtwork}>
                <View
                  style={[
                    styles.detailsArtworkInner,
                    isItemPlaying && styles.detailsArtworkPlaying,
                  ]}
                >
                  <Text style={styles.detailsArtworkEmoji}>
                    {isItemPlaying ? "🔊" : "🎙️"}
                  </Text>
                </View>
              </View>

              {/* Titre */}
              <Text style={styles.detailsTitle}>{selectedPodcast.libelle}</Text>

              {/* Catégorie */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>#{categorieNom}</Text>
              </View>

              {/* Bouton lecture */}
              <TouchableOpacity
                style={[
                  styles.playButtonLarge,
                  isItemPlaying && styles.playButtonLargePlaying,
                ]}
                onPress={() => handlePlay(selectedPodcast)}
                disabled={isLoadingAudio}
              >
                {isLoadingAudio && isActive ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.playButtonLargeIcon}>
                      {isItemPlaying ? "⏸" : "▶"}
                    </Text>
                    <Text style={styles.playButtonLargeText}>
                      {isItemPlaying ? "Mettre en pause" : "Écouter le podcast"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {isActive && (
                <TouchableOpacity
                  style={styles.stopButtonLarge}
                  onPress={stopAudio}
                >
                  <Text style={styles.stopButtonLargeIcon}>⏹</Text>
                  <Text style={styles.stopButtonLargeText}>Arrêter</Text>
                </TouchableOpacity>
              )}

              {/* Section Infos */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Informations</Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailsIconBox}>
                    <Text style={styles.detailsIconEmoji}>👤</Text>
                  </View>
                  <View style={styles.detailsRowContent}>
                    <Text style={styles.detailsLabel}>Auteur</Text>
                    <Text style={styles.detailsValue}>{membreNom}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailsIconBox}>
                    <Text style={styles.detailsIconEmoji}>📁</Text>
                  </View>
                  <View style={styles.detailsRowContent}>
                    <Text style={styles.detailsLabel}>Catégorie</Text>
                    <Text style={styles.detailsValue}>{categorieNom}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailsIconBox}>
                    <Text style={styles.detailsIconEmoji}>📅</Text>
                  </View>
                  <View style={styles.detailsRowContent}>
                    <Text style={styles.detailsLabel}>Date de publication</Text>
                    <Text style={styles.detailsValue}>
                      {formatDate(selectedPodcast.created_at)} à{" "}
                      {formatTime(selectedPodcast.created_at)}
                    </Text>
                  </View>
                </View>

                {selectedPodcast.updated_at !== selectedPodcast.created_at && (
                  <View style={styles.detailsRow}>
                    <View style={styles.detailsIconBox}>
                      <Text style={styles.detailsIconEmoji}>🔄</Text>
                    </View>
                    <View style={styles.detailsRowContent}>
                      <Text style={styles.detailsLabel}>
                        Dernière modification
                      </Text>
                      <Text style={styles.detailsValue}>
                        {formatDate(selectedPodcast.updated_at)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Section Description */}
              {selectedPodcast.description && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Description</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>
                      {selectedPodcast.description}
                    </Text>
                  </View>
                </View>
              )}

              {/* Section Fichier */}
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Fichier audio</Text>
                <View style={styles.fileBox}>
                  <Text style={styles.fileIcon}>🎵</Text>
                  <Text style={styles.fileName} numberOfLines={2}>
                    {selectedPodcast.fichier.split("/").pop()}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.detailsActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(selectedPodcast)}
                >
                  <Text style={styles.deleteButtonIcon}>🗑️</Text>
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ==================== RENDU LISTE ====================

  const renderEpisode = ({ item }: { item: Podcast }) => {
    const membreNom = item.membre
      ? `${item.membre.prenom} ${item.membre.nom}`
      : "Inconnu";
    const categorieNom =
      item.categorie?.nom || item.categorie?.libelle || "N/A";
    const isActive = currentPodcast?.id === item.id;
    const isItemPlaying = isActive && isPlaying;

    return (
      <TouchableOpacity
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => openDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Icône */}
          <View
            style={[
              styles.iconContainer,
              isActive && styles.iconContainerActive,
            ]}
          >
            <Text style={styles.icon}>{isItemPlaying ? "🔊" : "🎙️"}</Text>
          </View>

          {/* Infos */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.libelle}
            </Text>
            <Text style={styles.author}>{membreNom}</Text>
            <Text style={styles.meta}>
              #{categorieNom} • {formatDate(item.created_at)}
            </Text>
          </View>

          {/* Bouton play rapide */}
          <TouchableOpacity
            style={[
              styles.quickPlayBtn,
              isItemPlaying && styles.quickPlayBtnActive,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handlePlay(item);
            }}
          >
            {isLoadingAudio && isActive ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.quickPlayBtnText}>
                {isItemPlaying ? "⏸" : "▶"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ==================== MINI PLAYER ====================

  const MiniPlayer = () => {
    if (!currentPodcast) return null;

    const membreNom = currentPodcast.membre
      ? `${currentPodcast.membre.prenom} ${currentPodcast.membre.nom}`
      : "Inconnu";

    return (
      <TouchableOpacity
        style={styles.miniPlayer}
        onPress={() => openDetails(currentPodcast)}
        activeOpacity={0.9}
      >
        <View style={styles.miniPlayerLeft}>
          <View style={styles.miniPlayerArtwork}>
            <Text style={styles.miniPlayerEmoji}>
              {isPlaying ? "🔊" : "🎙️"}
            </Text>
          </View>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentPodcast.libelle}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {membreNom}
            </Text>
          </View>
        </View>
        <View style={styles.miniPlayerControls}>
          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.miniPlayerBtn}>{isPlaying ? "⏸" : "▶"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={stopAudio}>
            <Text style={styles.miniPlayerBtn}>⏹</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ==================== RENDU PRINCIPAL ====================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎙️ Podcasts</Text>
        <Text style={styles.headerSubtitle}>
          {filtered.length} {filtered.length > 1 ? "épisodes" : "épisode"}
        </Text>
      </View>

      {/* Recherche */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un podcast..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#33924b" />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderEpisode}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            currentPodcast && { paddingBottom: 120 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#33924b"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎧</Text>
              <Text style={styles.emptyText}>Aucun podcast trouvé</Text>
            </View>
          }
        />
      )}

      {/* Mini Player */}
      <MiniPlayer />

      {/* Modal Détails */}
      <PodcastDetails />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, currentPodcast && { bottom: 90 }]}
        onPress={() => router.push("/podcasts/create")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  // Header
  header: {
    backgroundColor: "#33924b",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 14, color: "#d1fae5", marginTop: 4 },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },
  clearSearch: { fontSize: 16, color: "#999", padding: 4 },

  // List
  list: { padding: 16, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
  },
  cardActive: { borderWidth: 2, borderColor: "#33924b" },
  cardContent: { flexDirection: "row", alignItems: "center" },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerActive: { backgroundColor: "#33924b" },
  icon: { fontSize: 26 },

  infoContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 },
  author: { fontSize: 13, color: "#33924b", marginBottom: 2 },
  meta: { fontSize: 11, color: "#888" },

  quickPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#33924b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  quickPlayBtnActive: { backgroundColor: "#f59e0b" },
  quickPlayBtnText: { fontSize: 18, color: "#fff" },

  // Mini Player
  miniPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    elevation: 10,
  },
  miniPlayerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  miniPlayerArtwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  miniPlayerEmoji: { fontSize: 20 },
  miniPlayerInfo: { flex: 1 },
  miniPlayerTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  miniPlayerArtist: { fontSize: 12, color: "#666" },
  miniPlayerControls: { flexDirection: "row", gap: 12 },
  miniPlayerBtn: { fontSize: 24 },

  // Loader
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 12, color: "#666" },

  // Empty
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#888" },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#33924b",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  fabText: { fontSize: 28, color: "#fff", marginTop: -2 },

  // ==================== MODAL DÉTAILS ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { fontSize: 18, color: "#666" },
  modalHeaderTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalContent: { padding: 20 },

  // Details Artwork
  detailsArtwork: { alignItems: "center", marginBottom: 20 },
  detailsArtworkInner: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsArtworkPlaying: { backgroundColor: "#33924b" },
  detailsArtworkEmoji: { fontSize: 60 },

  // Details Title
  detailsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },

  // Category Badge
  categoryBadge: {
    alignSelf: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryBadgeText: { color: "#33924b", fontWeight: "600", fontSize: 14 },

  // Play Button Large
  playButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#33924b",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  playButtonLargePlaying: { backgroundColor: "#f59e0b" },
  playButtonLargeIcon: { fontSize: 20, color: "#fff", marginRight: 10 },
  playButtonLargeText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Stop Button Large
  stopButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 24,
  },
  stopButtonLargeIcon: { fontSize: 18, marginRight: 8 },
  stopButtonLargeText: { fontSize: 15, fontWeight: "600", color: "#dc2626" },

  // Details Section
  detailsSection: { marginBottom: 24 },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // Details Row
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsIconEmoji: { fontSize: 18 },
  detailsRowContent: { flex: 1 },
  detailsLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  detailsValue: { fontSize: 15, fontWeight: "600", color: "#333" },

  // Description
  descriptionBox: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: { fontSize: 15, color: "#444", lineHeight: 22 },

  // File
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
  },
  fileIcon: { fontSize: 24, marginRight: 12 },
  fileName: { flex: 1, fontSize: 13, color: "#666" },

  // Actions
  detailsActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    paddingVertical: 14,
    borderRadius: 12,
  },
  editButtonIcon: { fontSize: 16, marginRight: 8 },
  editButtonText: { fontSize: 15, fontWeight: "600", color: "#0284c7" },

  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteButtonIcon: { fontSize: 16, marginRight: 8 },
  deleteButtonText: { fontSize: 15, fontWeight: "600", color: "#dc2626" },
});
