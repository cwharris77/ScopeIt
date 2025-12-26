import ErrorView from '@/components/ErrorView';
import Loading from '@/components/Loading';
import TaskView from '@/components/TaskView';
import { useTasks } from '@/hooks/useTasks';
import { FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const { tasks, loading, error } = useTasks();
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <TaskView task={item} />}
        keyExtractor={(item) => item}
      />
    </SafeAreaView>
  );
}
