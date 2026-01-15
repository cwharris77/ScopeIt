/**
 * Home Screen - Main task management view
 * Ported from web app with mobile styling
 */

import { FilterBar } from '@/components/FilterBar';
import { TaskCard } from '@/components/TaskCard';
import { Colors } from '@/constants/colors';
import { CATEGORY_ALL, SortOption, TASK_STATUS } from '@/constants/taskStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TasksContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { tasks, loading, refetch, startTask, pauseTask, completeTask, deleteTask } = useTasks();

  // Filter & Sort State
  const [filterCategory, setFilterCategory] = useState<string>(CATEGORY_ALL);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [refreshing, setRefreshing] = useState(false);

  // Process and filter tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by category
    if (filterCategory !== CATEGORY_ALL) {
      result = result.filter((t) => t.category === filterCategory);
    }

    // Sort tasks
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'duration') {
        return (b.estimated_minutes || 0) - (a.estimated_minutes || 0);
      }
      return 0;
    });

    return result;
  }, [tasks, filterCategory, sortBy]);

  // Separate active and completed tasks
  const activeTasks = processedTasks.filter((t) => t.status !== TASK_STATUS.COMPLETED);
  const completedTasks = processedTasks.filter((t) => t.status === TASK_STATUS.COMPLETED);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    router.push('/add-task');
  };

  const handleStartTask = async (id: string) => {
    await startTask(id);
  };

  const handlePauseTask = async (id: string) => {
    await pauseTask(id);
  };

  const handleCompleteTask = async (id: string) => {
    await completeTask(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const renderSectionHeader = (title: string, count: number, isActive: boolean) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, !isActive && styles.sectionTitleMuted]}>{title}</Text>
      <View style={[styles.countBadge, !isActive && styles.countBadgeMuted]}>
        <Text style={[styles.countText, !isActive && styles.countTextMuted]}>{count}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Your timeline is empty</Text>
      <Text style={styles.emptySubtitle}>Add a task to start tracking</Text>
    </View>
  );

  const renderFilteredEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="filter-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.emptyTitle}>No tasks match filter</Text>
      <Pressable onPress={() => setFilterCategory(CATEGORY_ALL)}>
        <Text style={styles.resetFilter}>Reset Filter</Text>
      </Pressable>
    </View>
  );

  const ListHeader = () => (
    <>
      {/* App Header */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.appTitle}>ScopeIt</Text>
          <Text style={styles.appSubtitle}>MASTER YOUR ESTIMATION</Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </Pressable>
      </View>

      {/* Filter Bar */}
      {tasks.length > 0 && (
        <FilterBar
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          itemCount={processedTasks.length}
        />
      )}

      {/* Empty States */}
      {tasks.length === 0 && renderEmptyState()}
      {tasks.length > 0 && processedTasks.length === 0 && renderFilteredEmpty()}

      {/* Active Section Header */}
      {activeTasks.length > 0 && renderSectionHeader('Active Sessions', activeTasks.length, true)}
    </>
  );

  const ListFooter = () => (
    <>
      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <>
          {renderSectionHeader('Archive', completedTasks.length, false)}
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={handleStartTask}
              onPause={handlePauseTask}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={activeTasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onStart={handleStartTask}
            onPause={handlePauseTask}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 120, // Space for tab bar
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleMuted: {
    color: Colors.textMuted,
  },
  countBadge: {
    backgroundColor: `${Colors.primary}30`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeMuted: {
    backgroundColor: `${Colors.textMuted}30`,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  countTextMuted: {
    color: Colors.textMuted,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    opacity: 0.6,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  resetFilter: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 12,
  },
});
