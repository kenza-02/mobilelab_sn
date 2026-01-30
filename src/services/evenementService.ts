/**
 * Service pour la gestion des événements via l'API Laravel
 */

import { API_ENDPOINTS } from '@/config/api';
import { Evenement, Intervenant } from '@/types/evenement';
import { Platform } from 'react-native';

/**
 * Créer un nouvel événement
 */
export const createEvenement = async (
  evenementData: Omit<Evenement, 'id' | 'created_at' | 'updated_at'>,
  imageUri?: string
): Promise<Evenement> => {
  try {
    const formData = new FormData();

    // Ajouter les champs texte
    formData.append('libelle', evenementData.libelle);
    formData.append('description', evenementData.description);
    formData.append('date_debut', evenementData.date_debut);
    formData.append('date_fin', evenementData.date_fin);
    formData.append('heure_debut', evenementData.heure_debut);
    formData.append('heure_fin', evenementData.heure_fin);
    formData.append('type', evenementData.type);

    if (evenementData.lieu) {
      formData.append('lieu', evenementData.lieu);
    }

    if (evenementData.lien) {
      formData.append('lien', evenementData.lien);
    }

    // Ajouter l'image si fournie
    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      if (Platform.OS === 'web') {
        // Sur le web, convertir l'image en Blob
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('image', blob, filename);
        } catch (error) {
          console.error('Erreur conversion image web:', error);
          throw new Error('Impossible de charger l\'image');
        }
      } else {
        // Sur mobile (iOS/Android), utiliser le format React Native
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
    }

    // Ajouter les IDs des intervenants si présents
    if (evenementData.intervenants && evenementData.intervenants.length > 0) {
      evenementData.intervenants.forEach((intervenant, index) => {
        if (intervenant.id) {
          formData.append(`intervenants[${index}]`, intervenant.id.toString());
        }
      });
    }

    const response = await fetch(API_ENDPOINTS.evenements.create, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Erreur lors de la création de l\'événement';
      
      try {
        const errorData = await response.json();
        
        // Gérer les erreurs de validation Laravel
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le status
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur createEvenement:', error);
    throw error;
  }
};

/**
 * Récupérer tous les événements
 */
export const getEvenements = async (): Promise<Evenement[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.evenements.list);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des événements');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getEvenements:', error);
    throw error;
  }
};

/**
 * Récupérer un événement par ID
 */
export const getEvenementById = async (id: number): Promise<Evenement> => {
  try {
    const response = await fetch(API_ENDPOINTS.evenements.show(id));

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'événement');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getEvenementById:', error);
    throw error;
  }
};

