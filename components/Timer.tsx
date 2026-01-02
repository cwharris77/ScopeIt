import { Task } from '@/lib/supabase';
import { Pause, Play } from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

type TimerProps = {
  task: Task;
  onUpdate: (updates: Partial<Task>, immediate?: boolean) => void;
};

export function Timer({ task, onUpdate }: TimerProps) {
  const [now, setNow] = useState(Date.now());
  const isRunning = !!task.started_at;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleToggle = () => {
    if (isRunning) {
      // Pause
      const start = new Date(task.started_at!).getTime();
      const delta = Math.floor((Date.now() - start) / 1000);
      onUpdate(
        {
          actual_seconds: (task.actual_seconds || 0) + delta,
          started_at: null,
        },
        true
      );
    } else {
      // Play
      onUpdate(
        {
          started_at: new Date().toISOString(),
        },
        true
      );
    }
  };

  const getElapsedSeconds = () => {
    const base = task.actual_seconds || 0;
    if (!isRunning) return base;
    const start = new Date(task.started_at!).getTime();
    return base + Math.floor((now - start) / 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <XStack alignItems="center" justifyContent="space-between" gap="$md" paddingVertical="$sm">
      {/* Estimate */}
      <YStack gap="$xs" flex={1}>
        <Text fontSize="$xs" color="$color11" fontWeight="bold">
          ESTIMATE (MIN)
        </Text>
        <Input
          size="$md"
          value={task.estimated_minutes?.toString()}
          onChange={(e: any) => {
            const text = e.nativeEvent.text;
            const val = parseInt(text) || 0;
            onUpdate({ estimated_minutes: val });
          }}
          keyboardType="numeric"
          backgroundColor="transparent"
          borderWidth={0}
          padding={0}
        />
      </YStack>

      {/* Play/Pause */}
      <Button
        circular
        size="$xl"
        icon={isRunning ? Pause : Play}
        onPress={handleToggle}
        backgroundColor={isRunning ? '$orange10' : '$green10'}
        hoverStyle={{ backgroundColor: isRunning ? '$orange11' : '$green11' }}
      />

      {/* Elapsed */}
      <YStack gap="$xs" flex={1} alignItems="flex-end">
        <Text fontSize="$xs" color="$color11" fontWeight="bold">
          ELAPSED
        </Text>
        <Text fontSize="$xl" fontWeight="bold" fontFamily="$mono">
          {formatTime(getElapsedSeconds())}
        </Text>
      </YStack>
    </XStack>
  );
}
