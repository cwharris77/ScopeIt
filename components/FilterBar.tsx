/**
 * FilterBar component for category filtering and sorting
 */

import { Colors } from '@/constants/colors';
import { CATEGORIES, CATEGORY_ALL, SORT_OPTIONS, SortOption } from '@/constants/taskStatus';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface FilterBarProps {
  selectedCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  itemCount: number;
}

export function FilterBar({
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  itemCount,
}: FilterBarProps) {
  const allCategories = [CATEGORY_ALL, ...CATEGORIES];
  const isAllSelected = selectedCategories.size === 0;

  return (
    <View style={styles.container}>
      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        <Ionicons name="filter-outline" size={14} color={Colors.textMuted} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}>
          {allCategories.map((cat) => {
            const isActive =
              cat === CATEGORY_ALL ? isAllSelected : selectedCategories.has(cat);
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
        <View style={styles.sortContainer}>
          <Ionicons name="swap-vertical-outline" size={14} color={Colors.textMuted} />
          <Pressable
            style={styles.sortButton}
            onPress={() => {
              // Cycle through sort options
              const currentIndex = SORT_OPTIONS.findIndex((o) => o.value === sortBy);
              const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
              onSortChange(SORT_OPTIONS[nextIndex].value);
            }}>
            <Text style={styles.sortText}>
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            </Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
          </Pressable>
        </View>
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});

export default FilterBar;
