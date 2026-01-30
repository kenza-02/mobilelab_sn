/**
 * Service pour la gestion des intervenants via l'API Laravel
 */

import { API_ENDPOINTS } from '@/config/api';
import { Intervenant } from '@/types/evenement';

/**
 * Créer un nouvel intervenant
 */
export const createIntervenant = async (
  intervenantData: Omit<Intervenant, 'id' | 'created_at' | 'updated_at'>
): Promise<Intervenant> => {
  try {
    const response = await fetch(API_ENDPOINTS.intervenants.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(intervenantData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de l\'intervenant');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur createIntervenant:', error);
    throw error;
  }
};

/**
 * Récupérer tous les intervenants
 */
export const getIntervenants = async (): Promise<Intervenant[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.intervenants.list);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des intervenants');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getIntervenants:', error);
    throw error;
  }
};

/**
 * Récupérer un intervenant par ID
 */
export const getIntervenantById = async (id: number): Promise<Intervenant> => {
  try {
    const response = await fetch(API_ENDPOINTS.intervenants.show(id));

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'intervenant');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur getIntervenantById:', error);
    throw error;
  }
};

