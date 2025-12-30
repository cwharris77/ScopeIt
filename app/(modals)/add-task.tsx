import { TasksProvider, useTasks } from '@/contexts/TasksContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddTaskModal() {
  const router = useRouter();
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEstimatedMinutes('30');
    router.back();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    const { error } = await addTask({
      name: title.trim(),
      description: description.trim(),
      estimated_minutes: parseInt(estimatedMinutes) || 30,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create task: ' + error);
      return;
    }

    // Success - close modal
    handleClose();
  };

  return (
    <TasksProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={handleClose}>
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}
            onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 24,
                paddingHorizontal: 24,
                paddingBottom: 40,
                minHeight: 400,
              }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', flex: 1 }}>New Task</Text>
                <Pressable onPress={handleClose} style={{ padding: 8 }}>
                  <Ionicons name="close" size={28} color="#6b7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Title Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                    }}>
                    Title *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                    placeholder="Enter task title"
                    placeholderTextColor="#9ca3af"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                  />
                </View>

                {/* Description Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                    }}>
                    Description
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                      minHeight: 120,
                      textAlignVertical: 'top',
                    }}
                    placeholder="Add details about your task..."
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={5}
                  />
                </View>

                {/* Estimated Minutes Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                    }}>
                    Estimated Minutes *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: '#1f2937',
                    }}
                    placeholder="Enter estimated minutes"
                    placeholderTextColor="#9ca3af"
                    value={estimatedMinutes}
                    onChangeText={setEstimatedMinutes}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Buttons */}
                <View style={{ gap: 12 }}>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#9ca3af' : '#087f8c',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                      {isSubmitting ? 'Creating...' : 'Create Task'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleClose}
                    style={{
                      backgroundColor: '#f3f4f6',
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </TasksProvider>
  );
}
