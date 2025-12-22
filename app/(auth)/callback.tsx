import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL params (Supabase sends them as hash fragments)
      const accessToken = params.access_token as string;
      const refreshToken = params.refresh_token as string;

      console.log('Callback params:', params);

      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
          } else {
            console.log('Session set successfully');
            router.replace('/(tabs)');
          }
        } catch (err) {
          console.error('Callback error:', err);
        }
      } else {
        console.log('No tokens found in callback');
        // If no tokens, redirect back to sign in
        setTimeout(() => router.replace('/(auth)'), 2000);
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Completing sign in...</Text>
    </View>
  );
}
