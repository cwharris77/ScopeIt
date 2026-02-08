import { FloatingTabBar } from '@/components/FloatingTabBar';
import { Colors } from '@/constants/colors';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background, width: '100%' },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Insights' }} />
    </Tabs>
  );
}
