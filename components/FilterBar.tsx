/**
 * FilterBar component for category filtering and sorting
 */

import { Dropdown } from '@/components/Dropdown';
import { Colors } from '@/constants/colors';
import { CATEGORIES, CATEGORY_ALL, SORT_OPTIONS, SortOption } from '@/constants/tasks';
import { Project } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface FilterBarProps {
  selectedCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  itemCount: number;
  projects: Project[];
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function FilterBar({
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  itemCount,
  projects,
  selectedProjectId,
  onProjectChange,
}: FilterBarProps) {
  const allCategories = [CATEGORY_ALL, ...CATEGORIES];
  const isAllSelected = selectedCategories.size === 0;

  return (
    <View style={styles.container}>
      {/* Project Filter Pills */}
      {projects.length > 0 && (
        <View style={styles.filterRow}>
          <Ionicons name="folder-outline" size={14} color={Colors.textMuted} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}>
            <Pressable
              onPress={() => onProjectChange(null)}
              style={[styles.pill, !selectedProjectId && styles.pillActive]}>
              <Text style={[styles.pillText, !selectedProjectId && styles.pillTextActive]}>
                All
              </Text>
            </Pressable>
            {projects.map((project) => {
              const isActive = selectedProjectId === project.id;
              return (
                <Pressable
                  key={project.id}
                  onPress={() => onProjectChange(isActive ? null : project.id)}
                  style={[
                    styles.pill,
                    isActive && {
                      backgroundColor: project.color || Colors.primary,
                      borderColor: project.color || Colors.primary,
                    },
                  ]}>
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {project.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        <Ionicons name="filter-outline" size={14} color={Colors.textMuted} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}>
          {allCategories.map((cat) => {
            const isActive = cat === CATEGORY_ALL ? isAllSelected : selectedCategories.has(cat);
            return (
              <Pressable
                key={cat}
                onPress={() => onCategoryToggle(cat)}
                style={[styles.pill, isActive && styles.pillActive]}>
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort and Count Row */}
      <View style={styles.sortRow}>
        <Dropdown
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={onSortChange}
          icon="swap-vertical-outline"
        />
        <Text style={styles.countText}>{itemCount} ITEMS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});

export default FilterBar;
