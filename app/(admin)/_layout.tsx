import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#33924bff' }, // couleur admin (bleu foncé par ex.)
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard Admin' }} />
      <Stack.Screen name="podcasts/index" options={{ title: 'Podcast' }} /> {/* cache header si tabs ou custom */}
      <Stack.Screen name="podcasts/create" options={{ title: 'Nouveau Podcast' }} />
      <Stack.Screen name="podcasts/[id]" options={{ title: 'Édition Podcast' }} />
      {/* Ajoute les autres routes ici */}
    </Stack>
  );
}