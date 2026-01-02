import { TaskPriority, TaskPriorityName, TaskPriorityType, TaskURLParams } from '@/types/tasks';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, XStack, YStack } from 'tamagui';

export default function EditTask() {
  const params = useLocalSearchParams<TaskURLParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [priorityName, setPriorityName] = useState<TaskPriorityName>('medium');
  const [priority, setPriority] = useState<TaskPriorityType>(TaskPriority.medium);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} paddingTop="$md" gap="$md">
        {/* Header */}
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
              {params.name}
            </Text>
          </XStack>
          <Separator marginVertical="$lg" />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
