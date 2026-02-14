/**
 * Header profile button — tap to open settings screen.
 */

import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export function ProfileButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityLabel="Settings"
      accessibilityRole="button">
      <Ionicons name="person-circle-outline" size={28} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
