import { useAuth } from '@/contexts/AuthContext';
import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6">
      <Text className="text-4xl font-bold text-white">Home</Text>
      <Button
        title="Sign Out"
        onPress={async () => {
          await signOut();
        }}
      />
    </SafeAreaView>
  );
}
