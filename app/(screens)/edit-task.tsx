/**
 * Edit Task Screen - Matches add-task modal styling
 * Redesigned to remove timer controls; uses save button instead
 */

import { PriorityPicker } from '@/components/PriorityPicker';
import { ProjectPicker } from '@/components/ProjectPicker';
import { Colors } from '@/constants/colors';
import {
  CATEGORIES,
  Category,
  TaskPriority,
  TaskPriorityName,
  TaskPriorityValue,
  TaskPriorityValueName,
  TaskURLParams,
} from '@/constants/tasks';
import { useTasks } from '@/contexts/TasksContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<TaskURLParams>();
  const { tasks, updateTask } = useTasks();

  // Find the task
  const task = tasks.find((t) => t.id === id);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<TaskPriorityName>('medium');
  const [expectedHours, setExpectedHours] = useState('0');
  const [expectedMins, setExpectedMins] = useState('30');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load task data
  useEffect(() => {
    if (task) {
      setTitle(task.name || '');
      setDescription(task.description || '');
      setCategory((task.category as Category) || 'work');
      setPriority(TaskPriorityValueName[task.priority as TaskPriorityValue] || 'medium');
      const totalMins = task.estimated_minutes || 0;
      setExpectedHours(Math.floor(totalMins / 60).toString());
      setExpectedMins((totalMins % 60).toString());
      setProjectId(task.project_id || null);
      setIsLoading(false);
    } else if (id) {
      // Task not found
      setIsLoading(false);
    }
  }, [task, id]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
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
    const { error } = await updateTask(id as string, {
      name: title.trim(),
      description: description.trim() || null,
      category: category,
      priority: TaskPriority[priority],
      estimated_minutes: totalMinutes,
      project_id: projectId,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to update task');
      return;
    }

    handleClose();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.errorText}>Task not found</Text>
        <Pressable style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Design System Sync"
                placeholderTextColor={Colors.textMuted}
                style={styles.textInput}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about your task..."
                placeholderTextColor={Colors.textMuted}
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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

            {/* Project Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PROJECT</Text>
              <ProjectPicker value={projectId} onChange={setProjectId} />
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

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={isSubmitting}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
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
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
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
    backgroundColor: Colors.backgroundTertiary,
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
    backgroundColor: Colors.backgroundTertiary,
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
    backgroundColor: Colors.backgroundSecondary,
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
