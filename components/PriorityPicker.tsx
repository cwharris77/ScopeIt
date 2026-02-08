import { Colors } from '@/constants/colors';
import { TaskPriorityName } from '@/constants/tasks';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text } from 'react-native';

interface PriorityPickerProps {
  value: TaskPriorityName;
  onChange: (value: TaskPriorityName) => void;
}

const PRIORITIES: {
  value: TaskPriorityName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: 'low', label: 'Low', icon: 'shield-outline', color: Colors.lowPriority },
  { value: 'medium', label: 'Medium', icon: 'shield-half-outline', color: Colors.mediumPriority },
  { value: 'high', label: 'High', icon: 'shield', color: Colors.highPriority },
];

const PADDING = 4;

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  const selectedIndex = PRIORITIES.findIndex((p) => p.value === value);
  const slideAnim = useRef(new Animated.Value(selectedIndex)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const segmentWidth = containerWidth > 0 ? (containerWidth - PADDING * 2) / PRIORITIES.length : 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: false,
      tension: 68,
      friction: 10,
    }).start();
  }, [selectedIndex, slideAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const selectedColor = PRIORITIES[selectedIndex].color;

  return (
    <Animated.View style={styles.container} onLayout={handleLayout}>
      {/* Sliding indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              backgroundColor: selectedColor,
              shadowColor: selectedColor,
              left: slideAnim.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [PADDING, PADDING + segmentWidth, PADDING + segmentWidth * 2],
              }),
            },
          ]}
        />
      )}

      {/* Segments */}
      {PRIORITIES.map((p) => {
        const isActive = p.value === value;
        return (
          <Pressable key={p.value} style={styles.segment} onPress={() => onChange(p.value)}>
            {/* <Ionicons name={p.icon} size={16} color={isActive ? Colors.white : Colors.textMuted} /> */}
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {p.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 14,
    padding: PADDING,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    borderRadius: 11,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.white,
  },
});
