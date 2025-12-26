import { Text, View } from 'react-native';

export default function TaskView({ task }: { task: any }) {
  return (
    <View className="m-2 w-full rounded-lg bg-white p-4">
      <Text className="text-lg font-semibold">{task.title}</Text>
      <Text className="text-gray-600">{task.description}</Text>
    </View>
  );
}
