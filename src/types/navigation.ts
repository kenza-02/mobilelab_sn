export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
};

export interface QuickAccessButton {
  id: string;
  title: string;
  targetPath: string;
  iconName?: string;
}
export const PUBLIC_WORDPRESS_API_URL = "https://citizenlab.africtivistes.org/senegal/graphql";