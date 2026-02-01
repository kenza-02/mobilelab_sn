import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const projectDetail = {
  id: "1",
  title: "Verdissement Urbain : Quartier Nord",
  category: "Écologie",
  imageUri:
    "https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg",
  status: "En cours",
  stats: { participants: 124, budget: "15k €", jours: 12 },
  description:
    "Transformer les zones bétonnées en poumons verts pour la ville.",
  fullContent:
    "Le 'Projet Vert' est une réponse directe au réchauffement urbain. En plantant 500 arbres et en créant des jardins partagés, nous visons à réduire la température de 2°C dans le quartier d'ici 2026. Ce projet appartient aux citoyens : chaque habitant peut parrainer un arbre ou proposer un emplacement pour un nouveau massif floral.",
  date: "Lancé le 15 Déc. 2025",
};

const ProjectDetailScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[BaseStyles.mainContainer, { backgroundColor: colors.background }]}
    >
      <View style={BaseStyles.headerFloating}>
        <TouchableOpacity
          style={[BaseStyles.backCircle, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/projets` as any)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.tint1} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: projectDetail.imageUri }}
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
              Projets
            </Text>
          </View>

          <Text style={[BaseStyles.title, { color: colors.text }]}>
            {projectDetail.title}
          </Text>

          <View style={BaseStyles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.text}
              style={{ opacity: 0.6 }}
            />
            <Text style={[BaseStyles.dateText, { color: colors.text }]}>
              {projectDetail.date}
            </Text>
          </View>
          {/* <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tint1 }]}>
                {projectDetail.stats.participants}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Soutiens
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.text + "20" },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tint1 }]}>
                {projectDetail.stats.budget}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Budget
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.text + "20" },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tint1 }]}>
                {projectDetail.stats.jours}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Jours restants
              </Text>
            </View>
          </View> */}

          <Text style={[BaseStyles.sectionTitle2, { color: colors.text }]}>
            À propos du projet
          </Text>
          <Text style={[BaseStyles.description, { color: colors.text }]}>
            {projectDetail.description}
          </Text>
          <Text style={[BaseStyles.fullContent, { color: colors.text }]}>
            {projectDetail.fullContent}
          </Text>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProjectDetailScreen;
