import { Colors, PROJECT_COLORS } from '@/constants/colors';
import { useTags } from '@/contexts/TagsContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface TagChipPickerProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagChipPicker({ value, onChange }: TagChipPickerProps) {
  const { tags, addTag } = useTags();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(PROJECT_COLORS[0]);

  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { data } = await addTag({ name: newName.trim(), color: newColor });
    if (data) {
      onChange([...value, data.id]);
    }
    setNewName('');
    setNewColor(PROJECT_COLORS[0]);
    setShowCreate(false);
  };

  return (
    <View>
      <View style={styles.chipsContainer}>
        {tags.map((tag) => {
          const isSelected = value.includes(tag.id);
          const tagColor = tag.color || Colors.textMuted;
          return (
            <Pressable
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
              style={[
                styles.chip,
                isSelected
                  ? { backgroundColor: tagColor, borderColor: tagColor }
                  : { backgroundColor: 'transparent', borderColor: tagColor },
              ]}>
              <Text style={[styles.chipText, { color: isSelected ? Colors.white : tagColor }]}>
                {tag.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setShowCreate(!showCreate)} style={[styles.chip, styles.addChip]}>
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={[styles.chipText, { color: Colors.white }]}>New</Text>
        </Pressable>
      </View>

      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            autoFocus
            value={newName}
            onChangeText={setNewName}
            placeholder="Tag name"
            placeholderTextColor={Colors.textMuted}
            style={styles.nameInput}
          />
          <View style={styles.colorRow}>
            {PROJECT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setNewColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  newColor === color && styles.colorSwatchActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.formActions}>
            <Pressable onPress={() => setShowCreate(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCreate} style={styles.saveBtn}>
              <Text style={styles.saveText}>Add</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  createForm: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  nameInput: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: Colors.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
