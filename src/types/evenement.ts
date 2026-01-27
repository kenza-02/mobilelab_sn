/**
 * Types TypeScript pour la section Événements
 */

export interface Intervenant {
  id?: number;
  prenom: string;
  nom: string;
  sexe: 'Homme' | 'Femme';
  created_at?: string;
  updated_at?: string;
}

export interface Evenement {
  id?: number;
  libelle: string;
  description: string;
  date_debut: string; // Format: YYYY-MM-DD
  date_fin: string; // Format: YYYY-MM-DD
  heure_debut: string; // Format: HH:MM
  heure_fin: string; // Format: HH:MM
  type: string;
  lieu?: string; // Obligatoire si mode présentiel
  lien?: string; // Obligatoire si mode en ligne
  image?: string;
  intervenants?: Intervenant[];
  created_at?: string;
  updated_at?: string;
}

export type ModeEvenement = 'presentiel' | 'enligne';

export type TypeEvenement = 
  | 'Atelier'
  | 'Conférence'
  | 'Formation'
  | 'Séminaire'
  | 'Webinaire'
  | 'Autre';

