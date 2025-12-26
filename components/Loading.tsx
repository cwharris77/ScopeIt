import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Loading() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Loading...</Text>
    </SafeAreaView>
  );
}
