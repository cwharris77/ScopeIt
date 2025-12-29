import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="add-task"
        options={{
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen name="edit-task" />
    </Stack>
  );
}
