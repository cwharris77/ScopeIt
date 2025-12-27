import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'add-task';
    const onAuthCallback = path.startsWith('(auth)/callback');

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
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false, title: 'Sign In' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-task"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          // contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
