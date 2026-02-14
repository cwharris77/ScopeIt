import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const token = session?.access_token;
      if (!token) {
        Alert.alert('Error', 'You must be signed in to delete your account.');
        return;
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await supabase.auth.signOut();
      Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{session?.user.email ?? 'Not signed in'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.row}
              onPress={() => Linking.openURL('https://scopedin.app/privacy')}
            >
              <Ionicons name="shield-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.rowText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.row}
              onPress={() => Linking.openURL('https://scopedin.app/terms')}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.rowText}>Terms of Service</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.card}>
            <Pressable style={styles.row} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.rowText}>Log Out</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.row} onPress={handleDeleteAccount} disabled={deleting}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.danger} style={{ marginLeft: 12 }} />
              ) : (
                <Text style={[styles.rowText, styles.dangerText]}>Delete Account</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
  },
  dangerText: {
    color: Colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },
});
