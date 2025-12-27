import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskView({ task }: { task: any }) {
  return (
    <SafeAreaView className="m-2 w-full rounded-lg bg-white p-4">
      <Text className="text-lg font-semibold">{task.task_name}</Text>
      <Text className="text-gray-600">{task.estimated_minutes} minutes</Text>
    </SafeAreaView>
  );
}
