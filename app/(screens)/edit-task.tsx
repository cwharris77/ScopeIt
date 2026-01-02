import Loading from '@/components/Loading';
import { PrioritySelect } from '@/components/PrioritySelect';
import { useAutoSaveTask } from '@/hooks/useAutoSaveTasks';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/supabase';
import {
  TaskPriority,
  TaskPriorityName,
  TaskPriorityType,
  TaskPriorityValueName,
  TaskURLParams,
} from '@/types/tasks';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, use, useMemo, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

function EditTaskContent({
  taskPromise,
}: {
  taskPromise: Promise<{ data: Task | null; error?: any }>;
}) {
  const { data: task, error } = use(taskPromise);
  const { id } = useLocalSearchParams<TaskURLParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [priority, setPriority] = useState<TaskPriorityName>(() => {
    const priorityValue = (task?.priority as TaskPriorityType) ?? TaskPriority.medium;
    return TaskPriorityValueName[priorityValue];
  });
  const [taskFields, setTaskFields] = useState({});

  useAutoSaveTask(id, taskFields);

  if (error || !task) return <Text>Task not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} paddingTop="$md" gap="$md">
        <XStack alignItems="center" paddingHorizontal="$md">
          <XStack flex={1}>
            <Button
              circular
              size="$lg"
              icon={ChevronLeft}
              scaleIcon={1.5}
              onPress={() => {
                router.back();
              }}
              variant="outlined"
            />
          </XStack>

          <Text fontSize="$xl">Edit Task</Text>

          <XStack flex={1} />
        </XStack>

        {/* Content area with margins and larger border radius */}
        <YStack
          flex={1}
          backgroundColor="$backgroundStrong"
          padding="$xl"
          paddingBottom={Math.max(insets.bottom, 16)}
          marginHorizontal="$md"
          marginBottom="$md"
          borderRadius={40}>
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$md">
            <Text fontSize="$xxl" fontWeight="semibold" flexShrink={1}>
              {task.name}
            </Text>
            <PrioritySelect
              value={priority}
              onChange={(priorityName) => {
                setPriority(priorityName);

                // Map string → numeric
                const priorityValue = TaskPriority[priorityName];
                setTaskFields((prev) => ({
                  ...prev,
                  priority: priorityValue,
                }));
              }}
            />
          </XStack>
          <Separator marginVertical="$xl" />
          <Text>{task.description}</Text>
          <Separator marginVertical="$xl" />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}

export default function EditTask() {
  const { id } = useLocalSearchParams<TaskURLParams>();
  const { getTask } = useTasks();

  const taskPromise = useMemo(() => {
    if (!id) return Promise.resolve({ data: null });
    return getTask(id);
  }, [id, getTask]);

  return (
    <Suspense fallback={<Loading />}>
      <EditTaskContent taskPromise={taskPromise as Promise<{ data: Task | null; error?: any }>} />
    </Suspense>
  );
}
