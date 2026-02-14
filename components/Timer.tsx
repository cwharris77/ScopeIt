import { Task } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type TimerProps = {
  task: Task;
  onUpdate: (updates: Partial<Task>, immediate?: boolean) => void;
};

export function Timer({ task, onUpdate }: TimerProps) {
  const [now, setNow] = useState(Date.now());
  const isRunning = !!task.started_at;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleToggle = () => {
    if (isRunning) {
      const start = new Date(task.started_at!).getTime();
      const delta = Math.floor((Date.now() - start) / 1000);
      onUpdate({ actual_seconds: (task.actual_seconds || 0) + delta, started_at: null }, true);
    } else {
      onUpdate({ started_at: new Date().toISOString() }, true);
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
    <View className="flex-row items-center justify-between gap-3 py-2">
      {/* Estimate */}
      <View className="flex-1 gap-1">
        <Text className="text-xs font-bold text-gray-400">ESTIMATE (MIN)</Text>
        <TextInput
          className="p-0 text-base text-white"
          value={task.estimated_minutes?.toString()}
          onChange={(e) => {
            const val = parseInt(e.nativeEvent.text) || 0;
            onUpdate({ estimated_minutes: val });
          }}
          keyboardType="numeric"
        />
      </View>

      {/* Play/Pause */}
      <Pressable
        onPress={handleToggle}
        className={`h-16 w-16 items-center justify-center rounded-full ${isRunning ? 'bg-orange-500' : 'bg-green-500'}`}>
        <Text className="text-2xl text-white">{isRunning ? '⏸' : '▶'}</Text>
      </Pressable>

      {/* Elapsed */}
      <View className="flex-1 items-end gap-1">
        <Text className="text-xs font-bold text-gray-400">ELAPSED</Text>
        <Text className="font-mono text-2xl font-bold text-white">
          {formatTime(getElapsedSeconds())}
        </Text>
      </View>
    </View>
  );
}
