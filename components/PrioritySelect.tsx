import { cn } from '@/lib/cn';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { TaskPriorityName } from '@/types/tasks';

type PrioritySelectProps = {
  value: TaskPriorityName;
  onChange: (value: TaskPriorityName) => void;
};

const PRIORITIES: TaskPriorityName[] = ['low', 'medium', 'high'];

function priorityBg(priority: TaskPriorityName) {
  switch (priority) {
    case 'low':
      return 'bg-low_priority';
    case 'medium':
      return 'bg-medium_priority';
    case 'high':
      return 'bg-high_priority';
    default:
      console.error(`Unknown priority: ${priority}`);
    //   throw new Error(`Unknown priority: ${priority}`);
  }
}

export function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'rounded-lg px-4 py-3',
          'flex-row items-center justify-between',
          priorityBg(value)
        )}>
        <Text className="font-semibold capitalize text-white">{value}</Text>
        <Text className="text-white">▼</Text>
      </Pressable>

      {/* Dropdown */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setOpen(false)}>
          <View className="w-64 overflow-hidden rounded-xl bg-white">
            {PRIORITIES.map((priority) => (
              <Pressable
                key={priority}
                onPress={() => {
                  onChange(priority);
                  setOpen(false);
                }}
                className={cn(
                  'px-4 py-3',
                  priorityBg(priority),
                  priority === value && 'opacity-90'
                )}>
                <Text className="font-medium capitalize text-white">{priority}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
