/**
 * Header profile button — tap to show log out confirmation.
 */

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet } from 'react-native';

export function ProfileButton() {
  const { signOut } = useAuth();

  const handlePress = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityLabel="Profile and log out"
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
