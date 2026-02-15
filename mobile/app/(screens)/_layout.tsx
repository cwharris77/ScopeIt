import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#181922' } }}>
      <Stack.Screen name="edit-task" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="tags" />
    </Stack>
  );
}
