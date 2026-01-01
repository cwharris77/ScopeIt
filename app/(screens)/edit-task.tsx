import { TaskURLParams } from '@/types/tasks';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditTask() {
  const params = useLocalSearchParams<TaskURLParams>();

  console.log('Params:', params);

  return (
    <SafeAreaView>
      <Text className="text-xl font-bold">Edit Task {params.name}</Text>
    </SafeAreaView>
  );
}
