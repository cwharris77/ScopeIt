/**
 * Enhanced TaskCard component
 * Ported from web app with mobile brand colors
 */

import { Colors } from '@/constants/colors';
import { TASK_STATUS, TaskStatus } from '@/constants/tasks';
import { Project, Tag, Task } from '@/lib/supabase';
import { formatTime, minutesToDisplay, secondsToDisplay } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  project?: Project | null;
  tags?: Tag[];
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, project, tags, onStart, onPause, onComplete, onDelete }: TaskCardProps) {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const status = (task.status as TaskStatus) || TASK_STATUS.PENDING;
  const isRunning = status === TASK_STATUS.RUNNING;
  const isCompleted = status === TASK_STATUS.COMPLETED;
  const isPaused = status === TASK_STATUS.PAUSED;

  // Live timer update
  useEffect(() => {
    if (!isRunning) return;

    // Update immediately to avoid stale state causing negative time
    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Pulse animation for the play icon only when running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  // Calculate elapsed seconds
  const getElapsedSeconds = () => {
    const base = task.actual_seconds || 0;
    if (!isRunning || !task.started_at) return base;
    const start = new Date(task.started_at).getTime();
    // Clamp to 0 to prevent negative time if 'now' is slightly behind 'start'
    return base + Math.max(0, Math.floor((now - start) / 1000));
  };

  const elapsedSeconds = getElapsedSeconds();
  const expectedSeconds = (task.estimated_minutes || 0) * 60;
  const variance = elapsedSeconds - expectedSeconds;
  const isOver = variance > 0;

  const handleEdit = () => {
    router.push(`/edit-task?id=${task.id}&name=${task.name}&priority=${task.priority}`);
  };

  function getVarianceColor() {
    if (!isCompleted) return Colors.textMuted;
    return isOver ? Colors.danger : Colors.success;
  }

  return (
    <View
      style={[
        styles.container,
        isRunning && styles.containerRunning,
        isCompleted && styles.containerCompleted,
      ]}>
      {/* Project color indicator */}
      {project && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 16,
            bottom: 16,
            width: 3,
            borderRadius: 2,
            backgroundColor: project.color || Colors.primary,
          }}
        />
      )}

      {/* Flowing top border for active task */}
      {isRunning && <View style={styles.flowingBorder} />}

      {/* Header with status and actions */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {isRunning ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : tags && tags.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
              {tags.slice(0, 3).map((tag) => (
                <View
                  key={tag.id}
                  style={[
                    styles.tagBadge,
                    { backgroundColor: `${tag.color || Colors.textMuted}20`, borderColor: tag.color || Colors.textMuted },
                  ]}>
                  <Text style={[styles.tagText, { color: tag.color || Colors.textMuted }]}>
                    {tag.name}
                  </Text>
                </View>
              ))}
              {tags.length > 3 && (
                <View style={styles.tagOverflow}>
                  <Text style={styles.tagOverflowText}>+{tags.length - 3}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category || 'Task'}</Text>
            </View>
          )}
          {isPaused && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>Paused</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleEdit} style={styles.actionButton}>
            <Ionicons name="pencil" size={18} color={Colors.textMuted} />
          </Pressable>
          <Pressable onPress={() => onDelete(task.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={2}>
        {task.name}
      </Text>

      {/* Time info grid */}
      <View style={[styles.timeGrid, isRunning && styles.timeGridRunning]}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>TARGET</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.timeValue}>{minutesToDisplay(task.estimated_minutes || 0)}</Text>
          </View>
        </View>
        <View style={styles.timeColumn}>
          <Text style={styles.timeLabel}>ELAPSED</Text>
          <View style={styles.timeRow}>
            {/* Animated play icon - pulses when running */}
            <Animated.View style={isRunning ? { transform: [{ scale: pulseAnim }] } : undefined}>
              <Ionicons
                name={isRunning ? 'play' : 'play-outline'}
                size={isRunning ? 18 : 14}
                color={
                  isRunning ? Colors.primary : isCompleted ? getVarianceColor() : Colors.textMuted
                }
              />
            </Animated.View>
            <Text
              style={[
                styles.elapsedValue,
                isRunning && styles.elapsedRunning,
                isCompleted && { color: getVarianceColor() },
              ]}>
              {secondsToDisplay(elapsedSeconds)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      {!isCompleted && (
        <View style={styles.buttonRow}>
          {isRunning ? (
            <Pressable
              onPress={() => onPause(task.id)}
              style={[styles.primaryButton, styles.pauseButton]}>
              <Ionicons name="pause" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Pause</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => onStart(task.id)}
              style={[styles.primaryButton, styles.startButton]}>
              <Ionicons name="play" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Start</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => onComplete(task.id)}>
              {({ pressed }) => (
                <View style={[styles.completeButton, pressed && styles.completeButtonPressed]}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={pressed ? Colors.success : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.completeButtonText,
                      pressed && styles.completeButtonTextPressed,
                    ]}>
                    Finish
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {/* Completed variance */}
      {isCompleted && (
        <View style={styles.varianceRow}>
          <View style={[styles.varianceDot, { backgroundColor: getVarianceColor() }]} />
          <Text style={[styles.varianceText, { color: getVarianceColor() }]}>
            {isOver
              ? `Over by ${formatTime(variance * 1000)}`
              : `Efficient: Ahead by ${formatTime(Math.abs(variance) * 1000)}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  containerRunning: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  containerCompleted: {
    opacity: 0.7,
    borderColor: Colors.border,
  },
  flowingBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  liveText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  categoryBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pausedBadge: {
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pausedText: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  timeGrid: {
    flexDirection: 'row',
    backgroundColor: `${Colors.backgroundSecondary}80`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  timeGridRunning: {
    backgroundColor: `${Colors.primary}15`,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  elapsedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  elapsedRunning: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  startButton: {
    backgroundColor: Colors.primary,
  },
  pauseButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  completeButtonPressed: {
    opacity: 0.7,
    borderColor: Colors.success,
  },
  completeButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  completeButtonTextPressed: {
    color: Colors.success,
  },
  varianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    gap: 8,
  },
  varianceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagOverflow: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: `${Colors.textMuted}20`,
  },
  tagOverflowText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
});

export default TaskCard;
