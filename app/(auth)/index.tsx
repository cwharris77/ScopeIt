import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthEmail() {
  const [email, setEmail] = useState('');
  const { signInWithProvider } = useAuth();
  const router = useRouter();

  const handleContinue = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    router.push(`/(auth)/password?email=${encodeURIComponent(email)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ScopedIn</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity style={[styles.button]} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.oauthContainer}>
        <TouchableOpacity style={styles.oauthButton} onPress={() => signInWithProvider('google')}>
          <Ionicons name="logo-google" size={24} color={Colors.text} />
          <Text style={styles.oauthButtonText}>Google</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.oauthButton} onPress={() => signInWithProvider('apple')}>
          <Ionicons name="logo-apple" size={24} color={Colors.text} />
          <Text style={styles.oauthButtonText}>Apple</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.oauthButton} onPress={() => signInWithProvider('github')}>
          <FontAwesome name="github" size={24} color={Colors.text} />
          <Text style={styles.oauthButtonText}>GitHub</Text>
        </TouchableOpacity>
      </View>

      <Link href="/sign-up" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
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
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: Colors.primary,
  },
  form: {
    gap: 15,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: Colors.textSecondary,
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  oauthButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  oauthButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  linkButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
  },
});
