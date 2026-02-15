import { Colors, PROJECT_COLORS } from '@/constants/colors';
import { PAGE_BOTTOM_PADDING } from '@/constants/layout';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTags } from '@/contexts/TagsContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Segment = 'projects' | 'tags';

export default function ManageTab() {
  const [segment, setSegment] = useState<Segment>('projects');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentRow}>
        <Pressable
          onPress={() => setSegment('projects')}
          style={[styles.segmentButton, segment === 'projects' && styles.segmentButtonActive]}>
          <Text
            style={[styles.segmentText, segment === 'projects' && styles.segmentTextActive]}>
            Projects
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('tags')}
          style={[styles.segmentButton, segment === 'tags' && styles.segmentButtonActive]}>
          <Text style={[styles.segmentText, segment === 'tags' && styles.segmentTextActive]}>
            Tags
          </Text>
        </Pressable>
      </View>

      {segment === 'projects' ? <ProjectsList /> : <TagsList />}
    </SafeAreaView>
  );
}

/* ───────── Projects ───────── */

function ProjectsList() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);

  const resetForm = () => {
    setName('');
    setSelectedColor(PROJECT_COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (editingId) {
      const { error } = await updateProject(editingId, {
        name: name.trim(),
        color: selectedColor,
      });
      if (error) {
        Alert.alert('Error', 'Failed to update project');
        return;
      }
    } else {
      const { error } = await addProject({
        name: name.trim(),
        color: selectedColor,
      });
      if (error) {
        Alert.alert('Error', 'Failed to create project');
        return;
      }
    }
    resetForm();
  };

  const handleEdit = (project: (typeof projects)[0]) => {
    setEditingId(project.id);
    setName(project.name);
    setSelectedColor(project.color ?? PROJECT_COLORS[0]);
    setShowForm(true);
  };

  const handleArchive = (id: string) => {
    Alert.alert('Archive Project', 'Tasks will keep their project assignment.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: () => updateProject(id, { archived: true }),
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'This will remove the project. Tasks will be unassigned.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteProject(id),
      },
    ]);
  };

  return (
    <>
      {/* Add Button */}
      <View style={styles.addRow}>
        <Pressable
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          style={styles.addButton}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>New Project</Text>
        </Pressable>
      </View>

      {/* Inline Form */}
      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Project name"
            placeholderTextColor={Colors.textMuted}
            style={styles.nameInput}
          />
          <View style={styles.colorRow}>
            {PROJECT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSwatchActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.formActions}>
            <Pressable onPress={resetForm} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>{editingId ? 'Save' : 'Create'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Projects List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[styles.colorBar, { backgroundColor: item.color ?? Colors.primary }]}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable onPress={() => handleEdit(item)} style={styles.iconButton}>
                <Ionicons name="pencil" size={18} color={Colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => handleArchive(item.id)} style={styles.iconButton}>
                <Ionicons name="archive-outline" size={18} color={Colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create one to organize your tasks</Text>
          </View>
        }
      />
    </>
  );
}

/* ───────── Tags ───────── */

function TagsList() {
  const { tags, addTag, updateTag, deleteTag } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);

  const resetForm = () => {
    setName('');
    setSelectedColor(PROJECT_COLORS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    if (editingId) {
      const { error } = await updateTag(editingId, {
        name: name.trim(),
        color: selectedColor,
      });
      if (error) {
        Alert.alert('Error', 'Failed to update tag');
        return;
      }
    } else {
      const { error } = await addTag({
        name: name.trim(),
        color: selectedColor,
      });
      if (error) {
        Alert.alert('Error', 'A tag with this name already exists');
        return;
      }
    }
    resetForm();
  };

  const handleEdit = (tag: (typeof tags)[0]) => {
    setEditingId(tag.id);
    setName(tag.name);
    setSelectedColor(tag.color || PROJECT_COLORS[0]);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Tag', 'This will remove the tag from all tasks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTag(id),
      },
    ]);
  };

  return (
    <>
      {/* Add Button */}
      <View style={styles.addRow}>
        <Pressable
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          style={styles.addButton}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>New Tag</Text>
        </Pressable>
      </View>

      {/* Inline Form */}
      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Tag name"
            placeholderTextColor={Colors.textMuted}
            style={styles.nameInput}
          />
          <View style={styles.colorRow}>
            {PROJECT_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorSwatchActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.formActions}>
            <Pressable onPress={resetForm} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>{editingId ? 'Save' : 'Create'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Tags List */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[styles.colorBar, { backgroundColor: item.color ?? Colors.primary }]}
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
            </View>
            <View style={styles.cardActions}>
              <Pressable onPress={() => handleEdit(item)} style={styles.iconButton}>
                <Ionicons name="pencil" size={18} color={Colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No tags yet</Text>
            <Text style={styles.emptySubtext}>Create one to organize your tasks</Text>
          </View>
        }
      />
    </>
  );
}

/* ───────── Styles ───────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  addRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  formContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  nameInput: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: Colors.white,
    borderWidth: 3,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  colorBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
