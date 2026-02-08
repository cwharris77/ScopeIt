/**
 * Add Task Modal - Enhanced with category selection and premium styling
 */

import { PriorityPicker } from '@/components/PriorityPicker';
import { Colors } from '@/constants/colors';
import { CATEGORIES, Category, TaskPriority, TaskPriorityName, TASK_STATUS } from '@/constants/tasks';
import { useTasks } from '@/contexts/TasksContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddTaskModal() {
  const router = useRouter();
  const { addTask } = useTasks();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<TaskPriorityName>('medium');
  const [expectedHours, setExpectedHours] = useState('0');
  const [expectedMins, setExpectedMins] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const hours = parseInt(expectedHours) || 0;
    const mins = parseInt(expectedMins) || 0;
    const totalMinutes = hours * 60 + mins;

    if (totalMinutes <= 0) {
      Alert.alert('Error', 'Please set an estimated duration');
      return;
    }

    setIsSubmitting(true);
    const { error } = await addTask({
      name: title.trim(),
      category: category,
      priority: TaskPriority[priority],
      estimated_minutes: totalMinutes,
      status: TASK_STATUS.PENDING,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create task');
      return;
    }

    handleClose();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                autoFocus
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Design System Sync"
                placeholderTextColor={Colors.textMuted}
                style={styles.textInput}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.categoryPill, category === cat && styles.categoryPillActive]}>
                    <Text
                      style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Priority Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRIORITY</Text>
              <PriorityPicker value={priority} onChange={setPriority} />
            </View>

            {/* Duration Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ESTIMATION</Text>
              <View style={styles.durationContainer}>
                <View style={styles.durationColumn}>
                  <TextInput
                    value={expectedHours}
                    onChangeText={setExpectedHours}
                    keyboardType="number-pad"
                    style={styles.durationInput}
                    maxLength={2}
                  />
                  <Text style={styles.durationLabel}>HRS</Text>
                </View>
                <Text style={styles.durationSeparator}>:</Text>
                <View style={styles.durationColumn}>
                  <TextInput
                    value={expectedMins}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num <= 59) setExpectedMins(text);
                    }}
                    keyboardType="number-pad"
                    style={styles.durationInput}
                    maxLength={2}
                  />
                  <Text style={styles.durationLabel}>MINS</Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating...' : 'Initialize Task'}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 520,
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationColumn: {
    flex: 1,
    alignItems: 'center',
  },
  durationInput: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 12,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textMuted,
    marginTop: 8,
    letterSpacing: 1,
  },
  durationSeparator: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textMuted,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
});
