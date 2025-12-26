import ErrorView from '@/components/ErrorView';
import TaskView from '@/components/TaskView';
import { useTasks } from '@/hooks/useTasks';
import { FlatList, Text, View } from 'react-native';

export default function TasksScreen() {
  const { tasks, loading, error } = useTasks();
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <TaskView task={item} />}
        keyExtractor={(item) => item}
      />
    </View>
  );
}
