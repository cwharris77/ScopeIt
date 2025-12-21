import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#64748B',
        tabBarInactiveTintColor: '#0B1220',
        tabBarStyle: { backgroundColor: '#0B1220' }, // Tab bar
        tabBarItemStyle: { backgroundColor: '#0B1220' }, // Tab bar items
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
    </Tabs>
  );
}
