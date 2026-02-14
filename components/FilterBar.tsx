/**
 * FilterBar component for category filtering and sorting
 */

import { Dropdown } from '@/components/Dropdown';
import { Colors } from '@/constants/colors';
import { SORT_OPTIONS, SortOption } from '@/constants/tasks';
import { Project, Tag } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface FilterBarProps {
  tags: Tag[];
  selectedTagIds: Set<string>;
  onTagToggle: (tagId: string) => void;
  onClearTagFilters: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  itemCount: number;
  projects: Project[];
  selectedProjectId: string | null;
  onProjectChange: (projectId: string | null) => void;
}

export function FilterBar({
  tags,
  selectedTagIds,
  onTagToggle,
  onClearTagFilters,
  sortBy,
  onSortChange,
  itemCount,
  projects,
  selectedProjectId,
  onProjectChange,
}: FilterBarProps) {
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

      {/* Tag Filter Pills */}
      {tags.length > 0 && (
        <View style={styles.filterRow}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.textMuted} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}>
            <Pressable
              onPress={onClearTagFilters}
              style={[styles.pill, selectedTagIds.size === 0 && styles.pillActive]}>
              <Text style={[styles.pillText, selectedTagIds.size === 0 && styles.pillTextActive]}>
                All
              </Text>
            </Pressable>
            {tags.map((tag) => {
              const isActive = selectedTagIds.has(tag.id);
              const tagColor = tag.color || Colors.primary;
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => onTagToggle(tag.id)}
                  style={[
                    styles.pill,
                    isActive && { backgroundColor: tagColor, borderColor: tagColor },
                  ]}>
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {tag.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

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
