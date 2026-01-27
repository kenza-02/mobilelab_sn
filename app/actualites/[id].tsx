import { useTheme } from "@/hooks/useTheme";
import { BaseStyles } from "@/styles/BaseStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const articleData = {
  id: "1",
  title: "Projet de verdissement urbain",
  imageUri:
    "https://img.freepik.com/free-photo/front-view-stacked-books-graduation-cap-ladders-education-day_23-2149241014.jpg",
  description:
    "Une initiative locale visant à transformer les espaces urbains en zones vertes.",
  fullContent:
    "Le 'Projet Vert' est plus qu'une simple initiative d'embellissement. Il vise à améliorer la qualité de l'air, à créer des îlots de fraîcheur pour lutter contre les vagues de chaleur, et à renforcer le lien social grâce à des activités de jardinage participatif. La première phase, qui a débuté en novembre, a déjà permis de planter plus de 500 arbres et arbustes indigènes. Des ateliers de sensibilisation à l'environnement seront organisés tout au long de l'année prochaine pour mobiliser la population et assurer la pérennité des aménagements.",
  date: "15 Déc. 2025",
  category: "ACTUALITÉ",
};

const NewsDetailScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[BaseStyles.mainContainer, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="light-content" />
      <View style={BaseStyles.headerFloating}>
        <TouchableOpacity
          style={[BaseStyles.backCircle, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/actualites` as any)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.tint1} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: articleData.imageUri }}
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
              Actualités
            </Text>
          </View>

          <Text style={[BaseStyles.title, { color: colors.text }]}>
            {articleData.title}
          </Text>

          <View style={BaseStyles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.text}
              style={{ opacity: 0.6 }}
            />
            <Text style={[BaseStyles.dateText, { color: colors.text }]}>
              {articleData.date}
            </Text>
            <View style={[BaseStyles.dot, { backgroundColor: colors.tint1 }]} />
            <Text style={[BaseStyles.readTime, { color: colors.text }]}>
              5 min de lecture
            </Text>
          </View>

          {/* Résumé mis en avant */}
          {/* <View
            style={[
              styles.resumeBox,
              { borderLeftColor: colors.tint1, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.resumeText, { color: colors.text }]}>
              {articleData.description}
            </Text>
          </View> */}
          <Text style={[BaseStyles.fullContent, { color: colors.text }]}>
            {articleData.fullContent}
          </Text>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default NewsDetailScreen;
