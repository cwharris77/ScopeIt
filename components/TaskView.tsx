import { Task } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function TaskView({ task }: { task: Task }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/edit-task?taskId=${task.id}&name=${task.name}`)}
      activeOpacity={0.9}
      className="bg-primary max-w-3/4 w-80 rounded-lg p-4">
      <Text className="text-lg font-semibold text-white">{task.name}</Text>
      <Text className="mb-2 text-gray-400">{task.description}</Text>
      <Text className="text-gray-200">{task.estimated_minutes} minutes</Text>
    </TouchableOpacity>
  );
}
