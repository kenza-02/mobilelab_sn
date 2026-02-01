import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";

type FormDataType = {
  libelle: string;
  description: string;
  membre: string;
  categorie: string;
};

type AudioFile = {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  file?: File;
} | null;

export default function PodcastForm() {
  const API_BASE_URL = "https://destined-amal-lispily.ngrok-free.dev/api";

  const [formData, setFormData] = useState<FormDataType>({
    libelle: "",
    description: "",
    membre: "",
    categorie: "",
  });

  const [audioFile, setAudioFile] = useState<AudioFile>(null);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [membres, setMembres] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Headers communs pour ngrok
  const getHeaders = () => ({
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const handleChange = (name: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        multiple: false,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        console.log("Fichier sélectionné:", asset);

        setAudioFile({
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType,
          size: asset.size,
          file: asset.file, // ← Le vrai objet File (disponible sur web)
        });
        setErrors((prev: any) => ({ ...prev, fichier: undefined }));
      }
    } catch (error) {
      console.error("Erreur sélection:", error);
      Alert.alert("Erreur", "Sélection du fichier échouée");
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.libelle) newErrors.libelle = "Le titre est requis";
    if (!formData.description)
      newErrors.description = "La description est requise";
    if (!formData.membre) newErrors.membre = "Auteur requis";
    if (!formData.categorie) newErrors.categorie = "Catégorie requise";
    if (!audioFile) newErrors.fichier = "Fichier audio requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);

        // Fetch membres
        const membresRes = await fetch(`${API_BASE_URL}/membres`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!membresRes.ok) {
          throw new Error(`Erreur membres: ${membresRes.status}`);
        }

        const membresJson = await membresRes.json();
        console.log("Membres reçus:", membresJson);
        setMembres(membresJson.data ?? membresJson);

        // Fetch catégories
        const categoriesRes = await fetch(`${API_BASE_URL}/categories`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!categoriesRes.ok) {
          throw new Error(`Erreur catégories: ${categoriesRes.status}`);
        }

        const categoriesJson = await categoriesRes.json();
        console.log("Catégories reçues:", categoriesJson);
        setCategories(categoriesJson.data ?? categoriesJson);
      } catch (error) {
        console.error("Erreur chargement données:", error);
        Alert.alert(
          "Erreur",
          "Chargement des données échoué. Vérifiez votre connexion.",
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("libelle", formData.libelle);
      data.append("description", formData.description);
      data.append("membre_id", formData.membre);
      data.append("categorie_id", formData.categorie);

      if (audioFile) {
        if (Platform.OS === "web") {
          // ✅ WEB : Utiliser le vrai objet File
          if (audioFile.file) {
            // Si DocumentPicker a fourni le File directement
            data.append("fichier", audioFile.file, audioFile.name);
          } else {
            // Sinon, fetch le blob depuis l'URI (data:// ou blob://)
            const response = await fetch(audioFile.uri);
            const blob = await response.blob();

            // Déterminer le type MIME
            let mimeType = audioFile.mimeType || "audio/mpeg";
            const extension = audioFile.name.split(".").pop()?.toLowerCase();
            const mimeTypes: { [key: string]: string } = {
              mp3: "audio/mpeg",
              wav: "audio/wav",
              m4a: "audio/mp4",
              ogg: "audio/ogg",
            };
            if (extension && mimeTypes[extension]) {
              mimeType = mimeTypes[extension];
            }

            const file = new File([blob], audioFile.name, { type: mimeType });
            data.append("fichier", file);
          }
        } else {
          // ✅ MOBILE : Utiliser l'objet {uri, name, type}
          let mimeType = audioFile.mimeType;
          if (!mimeType || mimeType === "application/octet-stream") {
            const extension = audioFile.name.split(".").pop()?.toLowerCase();
            const mimeTypes: { [key: string]: string } = {
              mp3: "audio/mpeg",
              wav: "audio/wav",
              m4a: "audio/mp4",
              ogg: "audio/ogg",
            };
            mimeType = mimeTypes[extension || ""] || "audio/mpeg";
          }

          data.append("fichier", {
            uri: audioFile.uri,
            name: audioFile.name,
            type: mimeType,
          } as any);
        }
      }

      console.log("Envoi en cours...");

      const response = await fetch(`${API_BASE_URL}/podcasts`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
        body: data,
      });

      const result = await response.json();
      console.log("Enregistrement réussi!");
      console.log("Status:", response.status);
      console.log("Podcast:", result);

      if (!response.ok) {
        if (result.errors) {
          console.log("Erreurs:", result.errors);
        }
        Alert.alert("Erreur", result.message || "Erreur serveur");
        return;
      }

      Alert.alert("Succès", "Podcast enregistré avec succès 🎙️");

      setFormData({ libelle: "", description: "", membre: "", categorie: "" });
      setAudioFile(null);
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Échec de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher un loader pendant le chargement des options
  if (isLoadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#33924bff" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎙️</Text>
          </View>
          <Text style={styles.title}>Nouveau Podcast</Text>
          <Text style={styles.subtitle}>
            Ajouter un nouveau podcast en ligne
          </Text>
        </View>

        <View style={styles.card}>
          {/* Titre */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Titre <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.libelle && styles.inputError]}
              placeholder="Ex : L'avenir de l'IA en Afrique"
              placeholderTextColor="#aaa"
              value={formData.libelle}
              onChangeText={(v) => handleChange("libelle", v)}
              maxLength={245}
            />
            {errors.libelle && (
              <Text style={styles.errorText}>{errors.libelle}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              multiline
              placeholder="Décrivez votre podcast..."
              placeholderTextColor="#aaa"
              value={formData.description}
              onChangeText={(v) => handleChange("description", v)}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Auteur */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Auteur <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.pickerContainer,
                errors.membre && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={formData.membre}
                onValueChange={(v) => handleChange("membre", v)}
                style={styles.picker}
              >
                <Picker.Item label="Choisir un auteur" value="" />
                {membres.map((m) => (
                  <Picker.Item
                    key={m.id}
                    label={`${m.prenom} ${m.nom}`}
                    value={String(m.id)}
                  />
                ))}
              </Picker>
            </View>
            {errors.membre && (
              <Text style={styles.errorText}>{errors.membre}</Text>
            )}
          </View>

          {/* Catégorie */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Catégorie <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.pickerContainer,
                errors.categorie && styles.inputError,
              ]}
            >
              <Picker
                selectedValue={formData.categorie}
                onValueChange={(v) => handleChange("categorie", v)}
                style={styles.picker}
              >
                <Picker.Item label="Choisir une catégorie" value="" />
                {categories.map((c) => (
                  <Picker.Item
                    key={c.id}
                    label={c.libelle}
                    value={String(c.id)}
                  />
                ))}
              </Picker>
            </View>
            {errors.categorie && (
              <Text style={styles.errorText}>{errors.categorie}</Text>
            )}
          </View>

          {/* Fichier audio */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Fichier audio <Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity style={styles.fileButton} onPress={pickAudioFile}>
              <Text style={styles.fileButtonText}>
                {audioFile ? audioFile.name : "Sélectionner un fichier audio"}
              </Text>
            </TouchableOpacity>

            {audioFile && (
              <Text style={styles.fileInfo}>
                Fichier sélectionné: {audioFile.name}
              </Text>
            )}

            {errors.fichier && (
              <Text style={styles.errorText}>{errors.fichier}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Publier le podcast</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#33924bff",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#e9d5ff", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: -30,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formGroup: { marginBottom: 22 },
  label: { fontSize: 15.5, fontWeight: "600", marginBottom: 8, color: "#333" },
  required: { color: "#f87171" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333",
  },
  textArea: { height: 110, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  errorText: { color: "#ef4444", fontSize: 13, marginTop: 5 },
  inputError: { borderColor: "#ef4444" },
  fileButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  fileButtonText: { fontSize: 15, color: "#666" },
  fileInfo: {
    marginTop: 8,
    fontSize: 13,
    color: "#33924bff",
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#33924bff",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
