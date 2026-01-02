import Loading from '@/components/Loading';
import { PrioritySelect } from '@/components/PrioritySelect';
import { Timer } from '@/components/Timer';
import { useAutoSaveTask } from '@/hooks/useAutoSaveTasks';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/supabase';
import {
  TaskPriority,
  TaskPriorityType,
  TaskPriorityValueName,
  TaskURLParams,
} from '@/types/tasks';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

function EditTaskContent({
  taskPromise,
}: {
  taskPromise: Promise<{ data: Task | null; error?: any }>;
}) {
  const { data: task, error } = use(taskPromise);
  const { id } = useLocalSearchParams<TaskURLParams>();
  const { updateTask } = useTasks();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [taskFields, setTaskFields] = useState<Partial<Task>>({});

  const displayTask = useMemo(() => {
    return { ...task, ...taskFields } as Task;
  }, [task, taskFields]);

  const priorityValue = (displayTask.priority as TaskPriorityType) ?? TaskPriority.medium;
  const priority = TaskPriorityValueName[priorityValue];

  // Handle saving
  const saveTask = useRef(() => {
    if (!id || Object.keys(taskFields).length === 0) return;
    updateTask(id as string, taskFields);
  });

  // Keep saveTask ref updated
  useEffect(() => {
    saveTask.current = () => {
      if (!id || Object.keys(taskFields).length === 0) return;
      updateTask(id as string, taskFields);
    };
  }, [id, taskFields, updateTask]);

  // AppState listener for background saving
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        saveTask.current();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useAutoSaveTask(id as string, taskFields);

  if (error || !task) return <Text>Task not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} paddingTop={12} gap={12}>
        <XStack alignItems="center" paddingHorizontal={12}>
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

          <Text fontSize={24}>Edit Task</Text>

          <XStack flex={1} />
        </XStack>

        {/* Content area with margins and larger border radius */}
        <YStack
          flex={1}
          backgroundColor="$backgroundStrong"
          padding={20}
          paddingBottom={Math.max(insets.bottom, 16)}
          marginHorizontal={12}
          marginBottom={12}
          borderRadius={40}>
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={12}>
            <Text fontSize={30} fontWeight="semibold" flexShrink={1}>
              {displayTask.name}
            </Text>
            <PrioritySelect
              value={priority}
              onChange={(priorityName) => {
                // Map string → numeric
                const priorityValue = TaskPriority[priorityName];
                setTaskFields((prev) => ({
                  ...prev,
                  priority: priorityValue,
                }));
              }}
            />
          </XStack>
          <Separator marginVertical={20} />
          <Text>{displayTask.description}</Text>
          <Separator marginVertical={20} />
          <Timer
            task={displayTask}
            onUpdate={(updates: Partial<Task>, immediate = false) => {
              setTaskFields((prev) => ({
                ...prev,
                ...updates,
              }));

              if (immediate) {
                updateTask(id as string, updates);
              }
            }}
          />
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
