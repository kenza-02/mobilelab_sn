import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { Directory, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DOCUMENTS_DATA = [
  {
    id: "1",
    title: "Guide de la participation",
    category: "Participation",
    size: "2.4 MB",
    description: "Comment s'impliquer dans les décisions locales.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "2",
    title: "Rapport Annuel 2025",
    category: "Rapports",
    size: "5.1 MB",
    description: "Bilan des activités et budgets de l'année passée.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "3",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "4",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "5",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "6",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "7",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "8",
    title: "Charte du Numérique",
    category: "Numérique",
    size: "1.2 MB",
    description: "Les règles de bonne conduite sur nos plateformes.",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

const CATEGORIES = [
  "Tous",
  "Gouvernance",
  "Numérique",
  "Participation",
  "Rapports",
];

const DocumentsScreen = () => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (url: string, fileName: string, id: string) => {
    try {
      setIsDownloading(id);
      const cleanName = fileName.replace(/\s+/g, "_") + ".pdf";
      const file = new File(Directory.cache, cleanName);

      await file.downloadAsync(url);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de télécharger le fichier.");
    } finally {
      setIsDownloading(null);
    }
  };

  const renderDocCard = ({ item }: { item: (typeof DOCUMENTS_DATA)[0] }) => (
    <View style={[styles.docCard, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.tint2 }]}>
        <Ionicons name="document-text" size={28} color={colors.tint1} />
      </View>
      <View style={styles.docInfo}>
        <View style={styles.badgeRow}>
          <Text style={[styles.categoryLabel, { color: colors.tint1 }]}>
            {item.category.toUpperCase()}
          </Text>
          <Text
            style={[styles.sizeLabel, { color: colors.text, opacity: 0.5 }]}
          >
            • {item.size}
          </Text>
        </View>
        <Text
          style={[styles.docTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.docDesc, { color: colors.text, opacity: 0.6 }]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDownload(item.url, item.title, item.id)}
        style={[styles.downloadBtn, { borderColor: colors.tint1 }]}
        disabled={isDownloading === item.id}
      >
        {isDownloading === item.id ? (
          <ActivityIndicator size="small" color={colors.tint1} />
        ) : (
          <Ionicons
            name="cloud-download-outline"
            size={22}
            color={colors.tint1}
          />
        )}
      </TouchableOpacity>
    </View>
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
                  name="document-outline"
                  color={colors.tint1}
                  style={BaseStyles.marginRight}
                  size={24}
                />
                Documents
              </Text>
            </View>

            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={BaseStyles.flatListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedCategory === item ? colors.tint : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedCategory === item ? "#FFF" : colors.text,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <FlatList
              data={
                selectedCategory === "Tous"
                  ? DOCUMENTS_DATA
                  : DOCUMENTS_DATA.filter(
                      (d) => d.category === selectedCategory
                    )
              }
              renderItem={renderDocCard}
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
  filterContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.1)",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  docInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sizeLabel: {
    fontSize: 10,
    marginLeft: 5,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  docDesc: {
    fontSize: 13,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});

export default DocumentsScreen;
