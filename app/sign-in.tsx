import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const { signInWithProvider } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Button title="Sign in with Google" onPress={() => signInWithProvider('google')} />
      <Button title="Sign in with Apple" onPress={() => signInWithProvider('apple')} />
      <Button title="Sign in with GitHub" onPress={() => signInWithProvider('github')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
