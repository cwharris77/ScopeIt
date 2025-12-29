import ErrorView from '@/components/ErrorView';
import Loading from '@/components/Loading';
import TaskView from '@/components/TaskView';
import { PAGE_BOTTOM_PADDING, PAGE_TOP_PADDING } from '@/constants/layout';
import { useTasks } from '@/contexts/TasksContext';
import { FlatList } from 'react-native';
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
    <SafeAreaView style={{ flex: 1, flexShrink: 0 }} edges={['top', 'left', 'right']}>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <TaskView task={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: PAGE_TOP_PADDING,
          paddingBottom: PAGE_BOTTOM_PADDING,
          gap: 12,
          alignItems: 'center',
          width: '100%',
        }}
      />
    </SafeAreaView>
  );
}
