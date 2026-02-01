import { Stack, Redirect } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Redirect href="/(admin)/podcasts" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}
