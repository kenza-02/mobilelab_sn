import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createEvenement } from '@/services/evenementService';
import { getIntervenants } from '@/services/intervenantService';
import { Intervenant, ModeEvenement, TypeEvenement } from '@/types/evenement';

export default function CreateEvenement() {
  // États du formulaire
  const [libelle, setLibelle] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [heureDebut, setHeureDebut] = useState(new Date());
  const [heureFin, setHeureFin] = useState(new Date());
  const [mode, setMode] = useState<ModeEvenement>('presentiel');
  const [lieu, setLieu] = useState('');
  const [lien, setLien] = useState('');
  const [typeEvenement, setTypeEvenement] = useState<TypeEvenement>('Atelier');
  const [autreType, setAutreType] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [intervenantsDisponibles, setIntervenantsDisponibles] = useState<Intervenant[]>([]);
  const [intervenantsSelectionnes, setIntervenantsSelectionnes] = useState<number[]>([]);

  // États UI
  const [loading, setLoading] = useState(false);
  const [loadingIntervenants, setLoadingIntervenants] = useState(true);
  const [showDateDebutPicker, setShowDateDebutPicker] = useState(false);
  const [showDateFinPicker, setShowDateFinPicker] = useState(false);
  const [showHeureDebutPicker, setShowHeureDebutPicker] = useState(false);
  const [showHeureFinPicker, setShowHeureFinPicker] = useState(false);

  /**
   * Charger les intervenants disponibles
   */
  useEffect(() => {
    const loadIntervenants = async () => {
      try {
        const data = await getIntervenants();
        setIntervenantsDisponibles(data);
      } catch (error) {
        console.error('Erreur chargement intervenants:', error);
        Alert.alert('Erreur', 'Impossible de charger les intervenants');
      } finally {
        setLoadingIntervenants(false);
      }
    };

    loadIntervenants();
  }, []);

  /**
   * Sélectionner une image depuis la galerie
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /**
   * Sélectionner/désélectionner un intervenant
   */
  const toggleIntervenant = (id: number) => {
    if (intervenantsSelectionnes.includes(id)) {
      setIntervenantsSelectionnes(intervenantsSelectionnes.filter((i) => i !== id));
    } else {
      setIntervenantsSelectionnes([...intervenantsSelectionnes, id]);
    }
  };

  /**
   * Afficher une alerte compatible web et mobile
   */
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  /**
   * Valider le formulaire
   */
  const validerFormulaire = (): boolean => {
    if (!libelle.trim()) {
      showAlert('Erreur', 'Le libellé est obligatoire');
      return false;
    }

    if (!description.trim()) {
      showAlert('Erreur', 'La description est obligatoire');
      return false;
    }

    if (mode === 'presentiel' && !lieu.trim()) {
      showAlert('Erreur', 'Le lieu est obligatoire pour un événement présentiel');
      return false;
    }

    if (mode === 'enligne' && !lien.trim()) {
      showAlert('Erreur', 'Le lien est obligatoire pour un événement en ligne');
      return false;
    }

    if (typeEvenement === 'Autre' && !autreType.trim()) {
      showAlert('Erreur', 'Veuillez préciser le type d\'événement');
      return false;
    }

    if (dateFin < dateDebut) {
      showAlert('Erreur', 'La date de fin doit être après la date de début');
      return false;
    }

    return true;
  };

  /**
   * Soumettre le formulaire
   */
  const handleSubmit = async () => {
    console.log('=== DÉBUT handleSubmit ===');
    console.log('Libellé:', libelle);
    console.log('Description:', description);
    console.log('Mode:', mode);
    console.log('Lieu:', lieu);
    console.log('Lien:', lien);
    
    if (!validerFormulaire()) {
      console.log('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie');
    setLoading(true);

    try {
      // Préparer les données de l'événement
      const evenementData = {
        libelle: libelle.trim(),
        description: description.trim(),
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0],
        heure_debut: `${heureDebut.getHours().toString().padStart(2, '0')}:${heureDebut.getMinutes().toString().padStart(2, '0')}`,
        heure_fin: `${heureFin.getHours().toString().padStart(2, '0')}:${heureFin.getMinutes().toString().padStart(2, '0')}`,
        type: typeEvenement === 'Autre' ? autreType.trim() : typeEvenement,
        lieu: mode === 'presentiel' ? lieu.trim() : '',
        lien: mode === 'enligne' ? lien.trim() : '',
        intervenants: intervenantsSelectionnes.map(id => ({ id })) as Intervenant[],
      };

      console.log('Données événement:', evenementData);
      console.log('Image URI:', imageUri);

      // Créer l'événement avec l'image (passer directement imageUri)
      const evenementCreated = await createEvenement(
        evenementData, 
        imageUri || undefined
      );
      
      console.log('Événement créé:', evenementCreated);

      console.log('✅ Événement créé avec succès !');
      
      // Afficher un message de succès
      if (Platform.OS === 'web') {
        alert('✅ Événement créé avec succès !');
      } else {
        Alert.alert(
          'Succès',
          'L\'événement a été créé avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Réinitialiser le formulaire
                resetForm();
              },
            },
          ]
        );
      }
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      // Afficher une erreur plus détaillée
      const errorMessage = error.message || 'Une erreur est survenue lors de la création de l\'événement';
      
      if (Platform.OS === 'web') {
        alert('❌ Erreur: ' + errorMessage);
      } else {
        Alert.alert('Erreur', errorMessage);
      }
    } finally {
      console.log('=== FIN handleSubmit ===');
      setLoading(false);
    }
  };

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = () => {
    setLibelle('');
    setDescription('');
    setDateDebut(new Date());
    setDateFin(new Date());
    setHeureDebut(new Date());
    setHeureFin(new Date());
    setMode('presentiel');
    setLieu('');
    setLien('');
    setTypeEvenement('Atelier');
    setAutreType('');
    setImageUri(null);
    setIntervenantsSelectionnes([]);
  };

  /**
   * Formater la date pour l'affichage
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Formater l'heure pour l'affichage
   */
  const formatTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Créer un événement</Text>
      </View>

      <View style={styles.form}>
        {/* Libellé */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Libellé *</Text>
          <TextInput
            style={styles.input}
            value={libelle}
            onChangeText={setLibelle}
            placeholder="Titre de l'événement"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description détaillée"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Mode (Présentiel / En ligne) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mode *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setMode('presentiel')}
            >
              <View style={[styles.radio, mode === 'presentiel' && styles.radioSelected]}>
                {mode === 'presentiel' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Présentiel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setMode('enligne')}
            >
              <View style={[styles.radio, mode === 'enligne' && styles.radioSelected]}>
                {mode === 'enligne' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>En ligne</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lieu (si présentiel) */}
        {mode === 'presentiel' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lieu *</Text>
            <TextInput
              style={styles.input}
              value={lieu}
              onChangeText={setLieu}
              placeholder="Adresse de l'événement"
              placeholderTextColor="#999"
            />
          </View>
        )}

        {/* Lien (si en ligne) */}
        {mode === 'enligne' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lien *</Text>
            <TextInput
              style={styles.input}
              value={lien}
              onChangeText={setLien}
              placeholder="https://..."
              placeholderTextColor="#999"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Type d'événement */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Type d'événement *</Text>
          <View style={styles.typeContainer}>
            {(['Atelier', 'Conférence', 'Formation', 'Séminaire', 'Webinaire', 'Autre'] as TypeEvenement[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  typeEvenement === type && styles.typeButtonSelected,
                ]}
                onPress={() => setTypeEvenement(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    typeEvenement === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {typeEvenement === 'Autre' && (
            <TextInput
              style={[styles.input, styles.marginTop]}
              value={autreType}
              onChangeText={setAutreType}
              placeholder="Précisez le type"
              placeholderTextColor="#999"
            />
          )}
        </View>

        {/* Date de début */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date de début *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={dateDebut.toISOString().split('T')[0]}
              onChange={(e) => setDateDebut(new Date(e.target.value))}
              style={{
                width: '100%',
                padding: 15,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateDebutPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatDate(dateDebut)}</Text>
              </TouchableOpacity>
              {showDateDebutPicker && (
                <DateTimePicker
                  value={dateDebut}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDateDebutPicker(Platform.OS === 'ios');
                    if (selectedDate) setDateDebut(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Date de fin */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date de fin *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={dateFin.toISOString().split('T')[0]}
              onChange={(e) => setDateFin(new Date(e.target.value))}
              style={{
                width: '100%',
                padding: 15,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateFinPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatDate(dateFin)}</Text>
              </TouchableOpacity>
              {showDateFinPicker && (
                <DateTimePicker
                  value={dateFin}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDateFinPicker(Platform.OS === 'ios');
                    if (selectedDate) setDateFin(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Heure de début */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Heure de début *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={formatTime(heureDebut)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours), parseInt(minutes));
                setHeureDebut(newTime);
              }}
              style={{
                width: '100%',
                padding: 15,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowHeureDebutPicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatTime(heureDebut)}</Text>
              </TouchableOpacity>
              {showHeureDebutPicker && (
                <DateTimePicker
                  value={heureDebut}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowHeureDebutPicker(Platform.OS === 'ios');
                    if (selectedTime) setHeureDebut(selectedTime);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Heure de fin */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Heure de fin *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={formatTime(heureFin)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours), parseInt(minutes));
                setHeureFin(newTime);
              }}
              style={{
                width: '100%',
                padding: 15,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowHeureFinPicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatTime(heureFin)}</Text>
              </TouchableOpacity>
              {showHeureFinPicker && (
                <DateTimePicker
                  value={heureFin}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowHeureFinPicker(Platform.OS === 'ios');
                    if (selectedTime) setHeureFin(selectedTime);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image de l'événement</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#2E7D32" />
            <Text style={styles.imageButtonText}>
              {imageUri ? 'Changer l\'image' : 'Choisir une image'}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={28} color="#f44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Intervenants */}
        <View style={styles.formGroup}>
          <View style={styles.intervenantsHeader}>
            <Text style={styles.label}>Intervenants</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/evenements/intervenants/create')}
            >
              <Ionicons name="add-circle" size={24} color="#2E7D32" />
              <Text style={styles.addButtonText}>Créer nouveau</Text>
            </TouchableOpacity>
          </View>

          {loadingIntervenants ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : intervenantsDisponibles.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun intervenant disponible</Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push('/evenements/intervenants/create')}
              >
                <Text style={styles.createFirstButtonText}>
                  Créer le premier intervenant
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.intervenantsList}>
              {intervenantsDisponibles.map((intervenant) => (
                <TouchableOpacity
                  key={intervenant.id}
                  style={[
                    styles.intervenantItem,
                    intervenantsSelectionnes.includes(intervenant.id!) &&
                      styles.intervenantItemSelected,
                  ]}
                  onPress={() => toggleIntervenant(intervenant.id!)}
                >
                  <View style={styles.intervenantInfo}>
                    <Text style={styles.intervenantName}>
                      {intervenant.prenom} {intervenant.nom}
                    </Text>
                    <Text style={styles.intervenantSexe}>{intervenant.sexe}</Text>
                  </View>
                  {intervenantsSelectionnes.includes(intervenant.id!) && (
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer l'événement</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2E7D32',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeButtonSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  marginTop: {
    marginTop: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  intervenantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  createFirstButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  intervenantsList: {
    gap: 10,
  },
  intervenantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  intervenantItemSelected: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    backgroundColor: '#f1f8f4',
  },
  intervenantInfo: {
    flex: 1,
  },
  intervenantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  intervenantSexe: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

