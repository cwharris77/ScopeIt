import { TaskURLParams } from '@/types/tasks';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, XStack } from 'tamagui';

export default function EditTask() {
  const params = useLocalSearchParams<TaskURLParams>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <XStack justifyContent="space-between" padding={10}>
        <Button
          icon={ChevronLeft}
          onPress={() => {
            router.back();
          }}
        />

        <Text className="text-center text-xl font-bold text-white">{params.name}</Text>
      </XStack>
    </SafeAreaView>
  );
}
