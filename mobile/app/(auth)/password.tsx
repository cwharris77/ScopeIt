import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthPassword() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSentLink, setHasSentLink] = useState(false);
  const { signInWithEmail, resendEmail } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithLink = async () => {
    setLoading(true);
    try {
      setHasSentLink(true);
      await resendEmail(email);
      Alert.alert('Email sent', 'Check your inbox for a sign-in link.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.form}>
        <Text style={styles.emailText}>Email: {email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing In…' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignInWithLink}>
          <Text style={styles.linkText}>{hasSentLink ? 'Resend link' : 'Sign in with link'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: Colors.primary,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  emailText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.text,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
});
