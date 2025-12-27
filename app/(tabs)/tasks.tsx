import ErrorView from '@/components/ErrorView';
import Loading from '@/components/Loading';
import TaskView from '@/components/TaskView';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';
import { Alert, Button, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const { tasks, loading, error, addTask } = useTasks();
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTask = async () => {
    setIsCreating(true);
    console.log('Adding task');

    const { data, error } = await addTask({
      task_name: 'New Task',
      estimated_minutes: 30,
    });

    setIsCreating(false);

    if (error) {
      Alert.alert('Error', 'Failed to create task: ' + error);
      console.error('Error creating task:', error);
      return;
    }

    // console.log('Task created:', data);
  };

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ErrorView error={error} />;
  }

  console.log('Rendering tasks:', tasks);

  return (
    <SafeAreaView className="p-4">
      <Button
        title={isCreating ? 'Creating...' : 'New Task'}
        onPress={handleAddTask}
        disabled={isCreating}
      />
      <FlatList
        data={tasks}
        renderItem={({ item }) => <TaskView task={item} />}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
