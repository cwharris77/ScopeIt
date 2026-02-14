import { Colors } from '@/constants/colors';
import { useProjects } from '@/contexts/ProjectsContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ProjectPickerProps {
  value: string | null;
  onChange: (projectId: string | null) => void;
}

export function ProjectPicker({ value, onChange }: ProjectPickerProps) {
  const { projects } = useProjects();
  const [open, setOpen] = useState(false);

  const selectedProject = value ? projects.find((p) => p.id === value) : null;

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <View style={styles.triggerContent}>
          {selectedProject ? (
            <>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: selectedProject.color || Colors.textMuted },
                ]}
              />
              <Text style={styles.triggerText}>{selectedProject.name}</Text>
            </>
          ) : (
            <Text style={styles.triggerPlaceholder}>No project</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            {/* No project option */}
            <Pressable
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              style={[styles.option, value === null && styles.optionSelected]}
            >
              <View style={styles.optionContent}>
                <View style={[styles.colorDot, { backgroundColor: Colors.textMuted }]} />
                <Text style={[styles.optionText, value === null && styles.optionTextSelected]}>
                  No project
                </Text>
              </View>
              {value === null && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
            </Pressable>

            {/* Project options */}
            {projects.map((project) => {
              const isSelected = project.id === value;
              return (
                <Pressable
                  key={project.id}
                  onPress={() => {
                    onChange(project.id);
                    setOpen(false);
                  }}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: project.color || Colors.textMuted },
                      ]}
                    />
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {project.name}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  triggerPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    width: 280,
    borderRadius: 24,
    padding: 20,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionSelected: {
    backgroundColor: `${Colors.primary}18`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
  },
});
