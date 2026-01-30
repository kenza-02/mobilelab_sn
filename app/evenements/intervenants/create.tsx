import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createIntervenant } from '@/services/intervenantService';

export default function CreateIntervenant() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState<'Homme' | 'Femme'>('Homme');
  const [loading, setLoading] = useState(false);

  /**
   * Valider le formulaire
   */
  const validerFormulaire = (): boolean => {
    if (!prenom.trim()) {
      if (Platform.OS === 'web') {
        alert('❌ Le prénom est obligatoire');
      } else {
        Alert.alert('Erreur', 'Le prénom est obligatoire');
      }
      return false;
    }

    if (!nom.trim()) {
      if (Platform.OS === 'web') {
        alert('❌ Le nom est obligatoire');
      } else {
        Alert.alert('Erreur', 'Le nom est obligatoire');
      }
      return false;
    }

    return true;
  };

  /**
   * Soumettre le formulaire
   */
  const handleSubmit = async () => {
    if (!validerFormulaire()) {
      return;
    }

    setLoading(true);

    try {
      await createIntervenant({
        prenom: prenom.trim(),
        nom: nom.trim(),
        sexe,
      });

      // Afficher un message de succès
      if (Platform.OS === 'web') {
        alert('✅ Intervenant créé avec succès !');
      } else {
        Alert.alert(
          'Succès',
          'L\'intervenant a été créé avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Réinitialiser le formulaire
                setPrenom('');
                setNom('');
                setSexe('Homme');
              },
            },
          ]
        );
      }

      // Réinitialiser le formulaire
      setPrenom('');
      setNom('');
      setSexe('Homme');
    } catch (error: any) {
      console.error('Erreur création intervenant:', error);
      
      if (Platform.OS === 'web') {
        alert('❌ ' + (error.message || 'Une erreur est survenue lors de la création de l\'intervenant'));
      } else {
        Alert.alert(
          'Erreur',
          error.message || 'Une erreur est survenue lors de la création de l\'intervenant'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Créer un intervenant</Text>
      </View>

      <View style={styles.form}>
        {/* Prénom */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={styles.input}
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Prénom de l'intervenant"
            placeholderTextColor="#999"
          />
        </View>

        {/* Nom */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Nom de l'intervenant"
            placeholderTextColor="#999"
          />
        </View>

        {/* Sexe */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Sexe *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setSexe('Homme')}
            >
              <View style={[styles.radio, sexe === 'Homme' && styles.radioSelected]}>
                {sexe === 'Homme' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Homme</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setSexe('Femme')}
            >
              <View style={[styles.radio, sexe === 'Femme' && styles.radioSelected]}>
                {sexe === 'Femme' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Femme</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.submitButtonText}>Créer l'intervenant</Text>
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
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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

