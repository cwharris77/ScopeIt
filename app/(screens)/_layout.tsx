import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-task" />
      <Stack.Screen name="edit-task" />
    </Stack>
  );
}
