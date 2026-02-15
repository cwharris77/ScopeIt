/**
 * FilterBar — compact single-row toolbar with bottom sheet filter panel
 */

import { Dropdown } from '@/components/Dropdown';
import { Colors } from '@/constants/colors';
import { SORT_OPTIONS, SortOption } from '@/constants/tasks';
import { Project, Tag } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasActiveFilters = selectedProjectId !== null || selectedTagIds.size > 0;

  const activeProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const activeTags = tags.filter((t) => selectedTagIds.has(t.id));

  const handleClearAll = () => {
    onProjectChange(null);
    onClearTagFilters();
  };

  return (
    <View style={styles.container}>
      {/* Single compact toolbar row */}
      <View style={styles.toolbar}>
        {/* Sort dropdown — left */}
        <Dropdown
          value={sortBy}
          options={SORT_OPTIONS}
          onChange={onSortChange}
          icon="swap-vertical-outline"
        />

        {/* Active filter chips — center */}
        {hasActiveFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {activeProject && (
              <Pressable
                style={[styles.chip, { backgroundColor: `${activeProject.color || Colors.primary}30` }]}
                onPress={() => onProjectChange(null)}
              >
                <Text
                  style={[styles.chipText, { color: activeProject.color || Colors.primary }]}
                  numberOfLines={1}
                >
                  {activeProject.name}
                </Text>
                <Ionicons name="close" size={12} color={activeProject.color || Colors.primary} />
              </Pressable>
            )}
            {activeTags.map((tag) => {
              const color = tag.color || Colors.primary;
              return (
                <Pressable
                  key={tag.id}
                  style={[styles.chip, { backgroundColor: `${color}30` }]}
                  onPress={() => onTagToggle(tag.id)}
                >
                  <Text style={[styles.chipText, { color }]} numberOfLines={1}>
                    {tag.name}
                  </Text>
                  <Ionicons name="close" size={12} color={color} />
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Spacer when no chips */}
        {!hasActiveFilters && <View style={{ flex: 1 }} />}

        {/* Count + filter button — right */}
        <View style={styles.rightGroup}>
          <Text style={styles.countText}>{itemCount}</Text>
          <Pressable style={styles.filterButton} onPress={() => setSheetOpen(true)}>
            <Ionicons name="funnel-outline" size={16} color={Colors.textSecondary} />
            {hasActiveFilters && <View style={styles.badgeDot} />}
          </Pressable>
        </View>
      </View>

      {/* Bottom sheet filter panel */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Projects section */}
            {projects.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="folder-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>
                <View style={styles.chipGrid}>
                  {projects.map((project) => {
                    const isActive = selectedProjectId === project.id;
                    const color = project.color || Colors.primary;
                    return (
                      <Pressable
                        key={project.id}
                        onPress={() => onProjectChange(isActive ? null : project.id)}
                        style={[
                          styles.sheetChip,
                          isActive
                            ? { backgroundColor: color, borderColor: color }
                            : { borderColor: `${color}60` },
                        ]}
                      >
                        <View style={[styles.colorDot, { backgroundColor: color }]} />
                        <Text
                          style={[
                            styles.sheetChipText,
                            isActive && { color: Colors.white },
                          ]}
                        >
                          {project.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Tags section */}
            {tags.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pricetag-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.sectionTitle}>Tags</Text>
                </View>
                <View style={styles.chipGrid}>
                  {tags.map((tag) => {
                    const isActive = selectedTagIds.has(tag.id);
                    const color = tag.color || Colors.primary;
                    return (
                      <Pressable
                        key={tag.id}
                        onPress={() => onTagToggle(tag.id)}
                        style={[
                          styles.sheetChip,
                          isActive
                            ? { backgroundColor: color, borderColor: color }
                            : { borderColor: `${color}60` },
                        ]}
                      >
                        <View style={[styles.colorDot, { backgroundColor: color }]} />
                        <Text
                          style={[
                            styles.sheetChipText,
                            isActive && { color: Colors.white },
                          ]}
                        >
                          {tag.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Clear All button */}
            {hasActiveFilters && (
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  handleClearAll();
                  setSheetOpen(false);
                }}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.danger} />
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    maxWidth: 120,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },

  // Bottom sheet styles
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.backgroundTertiary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '60%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
  },
});

export default FilterBar;
