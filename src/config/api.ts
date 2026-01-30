/**
 * Configuration de l'API Backend Laravel
 */

// URL de base de l'API Laravel
// À modifier selon votre environnement :
// - Émulateur Android : http://10.0.2.2:8000/api
// - Émulateur iOS : http://localhost:8000/api
// - Appareil physique : http://VOTRE_IP:8000/api (ex: http://192.168.1.10:8000/api)
export const BASE_URL = 'http://127.0.0.1:8000';
export const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Configuration des endpoints
 */
export const API_ENDPOINTS = {
  // Événements
  evenements: {
    list: `${API_BASE_URL}/evenements`,
    create: `${API_BASE_URL}/evenements`,
    show: (id: number) => `${API_BASE_URL}/evenements/${id}`,
    update: (id: number) => `${API_BASE_URL}/evenements/${id}`,
    delete: (id: number) => `${API_BASE_URL}/evenements/${id}`,
  },

  // Intervenants
  intervenants: {
    list: `${API_BASE_URL}/intervenants`,
    create: `${API_BASE_URL}/intervenants`,
    show: (id: number) => `${API_BASE_URL}/intervenants/${id}`,
    update: (id: number) => `${API_BASE_URL}/intervenants/${id}`,
    delete: (id: number) => `${API_BASE_URL}/intervenants/${id}`,
  },
};

