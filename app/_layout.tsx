import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.setOptions({
  fade: true,
  duration: 500,
});

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === '(screens)';
    const onAuthCallback = path.startsWith('/callback');

    // Don't redirect if we're on the auth callback page
    if (onAuthCallback) return;

    if (!session && inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace('/(auth)');
    } else if (session && !inAuthGroup) {
      // Redirect to app if authenticated
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, path]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ title: 'Sign In' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(screens)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <RootLayoutNav />
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
