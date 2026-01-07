import { useTheme } from "@/hooks/useTheme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAllMembers } from "@/services/api";
import { BaseStyles } from "@/styles/BaseStyles";

interface GraphQLSocial {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  // tiktok?: string;
}

interface GraphQLMemberNode {
  title: string;
  social: GraphQLSocial;
  fonctions: {
    equipe: string;
    fonction: string;
  };
  featuredImage: {
    node: {
      altText: string;
      mediaItemUrl: string;
    };
  };
}

interface TeamMemberFormatted {
  id: string;
  name: string;
  position: string;
  description: string;
  imageUri: string;
  socials: GraphQLSocial;
}

const openSocialLink = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.error(`Impossible d'ouvrir l'URL: ${url}`);
  }
};

const getIconColor = (platform: string, colors: any): string => {
  switch (platform) {
    case "linkedin":
      return "#0A66C2";
    case "facebook":
      return "#1877F2";
    case "twitter":
      return "#1DA1F2";
    case "instagram":
      return "#E4405F";
    case "tiktok":
      return "#000000";
    default:
      return colors.text;
  }
};

const getIconName = (platform: string) => {
  switch (platform) {
    case "linkedin":
      return "logo-linkedin";
    case "facebook":
      return "logo-facebook";
    case "twitter":
      return "logo-twitter";
    case "instagram":
      return "logo-instagram";
    case "tiktok":
      return "logo-tiktok";
    default:
      return "share-social-outline";
  }
};

const TeamMemberCard: React.FC<{
  member: TeamMemberFormatted;
  colors: any;
}> = ({ member, colors }) => {
  const socialLinks = Object.entries(member.socials)
    .filter(([, url]) => !!url)
    .map(([platform, url]) => ({ platform, url }));

  return (
    <View
      style={[
        styles.memberCard,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <Image source={{ uri: member.imageUri }} style={styles.memberImage} />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {member.name}
        </Text>
        <Text
          style={[
            styles.memberPosition,
            { color: colors.text, marginBottom: 5 },
          ]}
        >
          <FontAwesome
            name="user-circle-o"
            size={16}
            color={colors.tint1}
            style={BaseStyles.noMargin}
          />{" "}
          {member.position}
        </Text>
        {/* {member.description ? (
          <Text style={[styles.memberDescription, { color: colors.text }]}>
            {member.description}
          </Text>
        ) : null} */}
        <View style={styles.socialContainer}>
          {socialLinks.map(({ platform, url }) => (
            <TouchableOpacity
              key={platform}
              onPress={() => openSocialLink(url)}
              style={styles.socialButton}
            >
              <Ionicons
                name={getIconName(platform) as any}
                size={24}
                color={getIconColor(platform, colors)}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const TeamScreen: React.FC = () => {
  const { colors } = useTheme();

  const [teamMembers, setTeamMembers] = useState<TeamMemberFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data: GraphQLMemberNode[] = await getAllMembers();

        const formattedMembers: TeamMemberFormatted[] = data.map(
          (node, index) => ({
            id: node.title || `member-${index}`,
            name: node.title,
            position: node.fonctions?.fonction || "Membre de l'équipe",
            description: node.fonctions?.equipe || "",
            imageUri: node.featuredImage?.node?.mediaItemUrl,
            socials: node.social || {},
          })
        );

        setTeamMembers(formattedMembers);
        setError(null);
      } catch (err) {
        console.error("Erreur de chargement des membres:", err);
        setError(
          "Impossible de charger les données de l'équipe. Vérifiez l'URL de l'API et le réseau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const renderTeamMember = ({ item }: { item: TeamMemberFormatted }) => (
    <TeamMemberCard member={item} colors={colors} />
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
                  name="people-circle-outline"
                  color={colors.tint1}
                  style={BaseStyles.marginRight}
                  size={24}
                />
                Notre Équipe
              </Text>
            </View>
            <Text style={[styles.introText, { color: colors.text }]}>
              Découvrez les personnes passionnées et talentueuses qui sont à
              l'origine de notre projet. Connectez-vous avec elles !
            </Text>
            {loading && (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.tint2} />
                <Text style={{ color: colors.text, marginTop: 10 }}>
                  Chargement de l'équipe...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.centerContent}>
                <Ionicons name="alert-circle-outline" size={30} color="red" />
                <Text style={{ color: "red", textAlign: "center", margin: 10 }}>
                  {error}
                </Text>
              </View>
            )}

            {!loading && !error && teamMembers.length > 0 && (
              <FlatList
                data={teamMembers}
                renderItem={renderTeamMember}
                keyExtractor={(item) => item.id}
                contentContainerStyle={BaseStyles.flatListContent}
              />
            )}

            {!loading && !error && teamMembers.length === 0 && (
              <Text style={[styles.introText, { color: colors.text }]}>
                Aucun membre de l'équipe n'est disponible pour le moment.
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  memberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  memberPosition: {
    fontSize: 15,
    opacity: 0.8,
    flexDirection: "row",
    alignItems: "center",
  },
  memberDescription: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 10,
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  socialButton: {
    marginRight: 15,
    padding: 2,
  },
  centerContent: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 17,
    lineHeight: 22,
    opacity: 0.9,
  },
});

export default TeamScreen;
