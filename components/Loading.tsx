import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner } from 'tamagui';

export default function Loading() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Spinner size="large" color="" />
    </SafeAreaView>
  );
}
