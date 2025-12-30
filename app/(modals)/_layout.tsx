import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="add-task" />
    </Stack>
  );
}
