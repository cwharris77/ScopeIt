import { useTasks } from '@/contexts/TasksContext';
import { Task } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Hook to automatically save a task when the user navigates away, presses back, or the component unmounts.
 * @param taskId - The ID of the task to update
 * @param updatedFields - The current state of the task fields
 */
export function useAutoSaveTask(taskId: string, updatedFields: Partial<Task>) {
  const { updateTask } = useTasks();

  // Keep a ref to always hold the latest updatedFields
  const latestFieldsRef = useRef<Partial<Task>>(updatedFields);

  // Update ref whenever fields change
  useEffect(() => {
    latestFieldsRef.current = updatedFields;
  }, [updatedFields]);

  // Function to save task safely
  const saveTask = useCallback(() => {
    if (!taskId) return;
    updateTask(taskId, latestFieldsRef.current);
  }, [taskId, updateTask]);

  // --- Handle unmount ---
  useEffect(() => {
    return () => {
      saveTask();
    };
  }, [saveTask]);

  // --- Handle screen losing focus (navigation back or tab switch) ---
  useFocusEffect(
    useCallback(() => {
      return () => {
        saveTask();
      };
    }, [saveTask])
  );

  // --- Handle Android hardware back button ---
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        saveTask();
        return false; // allow default back behavior
      });

      return () => subscription.remove(); // <- call remove on the subscription
    }
  }, [saveTask]);
}
