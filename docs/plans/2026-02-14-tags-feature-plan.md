# Tags Feature + Tab Restructuring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded categories with user-defined tags (many-to-many), restructure mobile tabs to 3 tabs (Tasks, Projects, Insights). Both mobile and web.

**Architecture:** New `useTags` hook + `TagsContext` for tag CRUD. New `useTaskTags` hook for many-to-many join management. Replace category usage in FilterBar, TaskCard, and task forms on both platforms.

**Tech Stack:** React Native/Expo (mobile), Next.js (web), Supabase, TypeScript

---

## Phase 1: Shared Data Layer

### Task 1: Add Tag/TaskTag type exports

**Files:**
- Modify: `lib/supabase.ts`
- Modify: `shared/types/index.ts` (if exists, else `shared/types/supabase.ts` is already the source)

**Step 1: Add type exports to `lib/supabase.ts`**

After the Project type exports, add:

```typescript
export type Tag = Tables<'tags'>;
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];
export type TaskTag = Tables<'task_tags'>;
```

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat(tags): add Tag and TaskTag type exports"
```

---

### Task 2: Create `useTags` hook

**Files:**
- Create: `hooks/useTags.tsx`

**Step 1: Create the hook**

Same pattern as `useProjects` in `hooks/useProjects.tsx`:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Tag, TagInsert, TagUpdate } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useTags() {
  const { session } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchTags = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name', { ascending: true });

    if (error) {
      setError(error);
    } else {
      setTags(data || []);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = useCallback(
    async (tagData: Omit<TagInsert, 'user_id'>) => {
      if (!session?.user.id) return { data: null, error: 'No user' };

      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tagData, user_id: session.user.id })
        .select()
        .single();

      if (!error && data) {
        setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }

      return { data, error };
    },
    [session?.user.id]
  );

  const updateTag = useCallback(async (id: string, updates: TagUpdate) => {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTags((prev) =>
        prev.map((t) => (t.id === id ? data : t)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data, error };
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (!error) {
      setTags((prev) => prev.filter((t) => t.id !== id));
    }

    return { error };
  }, []);

  return {
    tags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
}
```

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add hooks/useTags.tsx
git commit -m "feat(tags): create useTags hook with CRUD"
```

---

### Task 3: Create `useTaskTags` hook

**Files:**
- Create: `hooks/useTaskTags.tsx`

**Step 1: Create the hook**

This hook manages the many-to-many relationship between tasks and tags. It preloads all tag assignments for the user's tasks.

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Tag } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export function useTaskTags() {
  const { session } = useAuth();
  const [tagsByTaskId, setTagsByTaskId] = useState<Map<string, Tag[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchTaskTags = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch all task_tags for the user's tasks, joined with tag data
    const { data, error } = await supabase
      .from('task_tags')
      .select('task_id, tags(*)')
      .in(
        'task_id',
        (
          await supabase
            .from('tasks')
            .select('id')
            .eq('user_id', session.user.id)
        ).data?.map((t) => t.id) || []
      );

    if (!error && data) {
      const map = new Map<string, Tag[]>();
      for (const row of data) {
        const taskId = row.task_id;
        const tag = row.tags as unknown as Tag;
        if (!tag) continue;
        if (!map.has(taskId)) map.set(taskId, []);
        map.get(taskId)!.push(tag);
      }
      setTagsByTaskId(map);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    fetchTaskTags();
  }, [fetchTaskTags]);

  const setTaskTags = useCallback(
    async (taskId: string, tagIds: string[]) => {
      // Delete existing tags for this task
      await supabase.from('task_tags').delete().eq('task_id', taskId);

      // Insert new tag assignments
      if (tagIds.length > 0) {
        await supabase
          .from('task_tags')
          .insert(tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId })));
      }

      // Refetch to get updated state
      await fetchTaskTags();
    },
    [fetchTaskTags]
  );

  const getTagsForTask = useCallback(
    (taskId: string): Tag[] => {
      return tagsByTaskId.get(taskId) || [];
    },
    [tagsByTaskId]
  );

  return {
    tagsByTaskId,
    loading,
    setTaskTags,
    getTagsForTask,
    refetch: fetchTaskTags,
  };
}
```

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add hooks/useTaskTags.tsx
git commit -m "feat(tags): create useTaskTags hook for many-to-many"
```

---

### Task 4: Create TagsContext and TaskTagsContext, wire into app

**Files:**
- Create: `contexts/TagsContext.tsx`
- Create: `contexts/TaskTagsContext.tsx`
- Modify: `app/_layout.tsx`

**Step 1: Create TagsContext**

```typescript
import { useTags as useTagsHook } from '@/hooks/useTags';
import { createContext, ReactNode, useContext } from 'react';

const TagsContext = createContext<ReturnType<typeof useTagsHook> | null>(null);

export function TagsProvider({ children }: { children: ReactNode }) {
  const tagsValue = useTagsHook();
  return <TagsContext.Provider value={tagsValue}>{children}</TagsContext.Provider>;
}

export function useTags() {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within TagsProvider');
  }
  return context;
}
```

**Step 2: Create TaskTagsContext**

```typescript
import { useTaskTags as useTaskTagsHook } from '@/hooks/useTaskTags';
import { createContext, ReactNode, useContext } from 'react';

const TaskTagsContext = createContext<ReturnType<typeof useTaskTagsHook> | null>(null);

export function TaskTagsProvider({ children }: { children: ReactNode }) {
  const taskTagsValue = useTaskTagsHook();
  return <TaskTagsContext.Provider value={taskTagsValue}>{children}</TaskTagsContext.Provider>;
}

export function useTaskTags() {
  const context = useContext(TaskTagsContext);
  if (!context) {
    throw new Error('useTaskTags must be used within TaskTagsProvider');
  }
  return context;
}
```

**Step 3: Wire into `app/_layout.tsx`**

Add imports and wrap:

```tsx
import { TagsProvider } from '@/contexts/TagsContext';
import { TaskTagsProvider } from '@/contexts/TaskTagsContext';

// In render:
<TasksProvider>
  <ProjectsProvider>
    <TagsProvider>
      <TaskTagsProvider>
        <RootLayoutNav />
      </TaskTagsProvider>
    </TagsProvider>
  </ProjectsProvider>
</TasksProvider>
```

**Step 4: Verify types compile**

Run: `npm run typecheck`

**Step 5: Commit**

```bash
git add contexts/TagsContext.tsx contexts/TaskTagsContext.tsx app/_layout.tsx
git commit -m "feat(tags): add TagsContext and TaskTagsContext providers"
```

---

## Phase 2: Mobile UI — Tag Assignment

### Task 5: Create `TagChipPicker` component

**Files:**
- Create: `components/TagChipPicker.tsx`

**Step 1: Create the component**

An inline chip picker for selecting multiple tags. Shows all user tags as colored pills — tap to toggle. Has a "+" chip to create a new tag.

Props:
- `selectedTagIds: string[]`
- `onChange: (tagIds: string[]) => void`

Uses `useTags()` from context. When "+" is pressed, shows a small inline form (name input + color swatches) to create a new tag without leaving the form.

The component should:
- Show tags as colored pills in a flex-wrap row
- Selected tags: filled background with tag color, white text
- Unselected tags: transparent background, border with tag color, tag-colored text
- "+" pill at the end with primary color
- Inline create form: text input + PROJECT_COLORS swatches + save/cancel

Style pattern: same as category pills in add-task modal (paddingHorizontal 14, paddingVertical 8, borderRadius 20).

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add components/TagChipPicker.tsx
git commit -m "feat(tags): create TagChipPicker component with inline create"
```

---

### Task 6: Replace categories with tags in add-task modal

**Files:**
- Modify: `app/(modals)/add-task.tsx`

**Step 1: Update the modal**

1. Remove `CATEGORIES` and `Category` imports
2. Remove category state and replace with tag state:
   ```typescript
   const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
   ```
3. Import `TagChipPicker` and `useTaskTags`:
   ```typescript
   import { TagChipPicker } from '@/components/TagChipPicker';
   import { useTaskTags } from '@/contexts/TaskTagsContext';
   ```
4. Get `setTaskTags` from context:
   ```typescript
   const { setTaskTags } = useTaskTags();
   ```
5. Replace the CATEGORY input group with TAGS:
   ```tsx
   <View style={styles.inputGroup}>
     <Text style={styles.label}>TAGS</Text>
     <TagChipPicker value={selectedTagIds} onChange={setSelectedTagIds} />
   </View>
   ```
6. Update `handleSubmit`: after creating the task, set its tags:
   ```typescript
   const { data, error } = await addTask({
     name: title.trim(),
     priority: TaskPriority[priority],
     estimated_minutes: totalMinutes,
     status: TASK_STATUS.PENDING,
     project_id: projectId,
   });
   // Note: removed category from addTask call

   if (!error && data) {
     if (selectedTagIds.length > 0) {
       await setTaskTags(data.id, selectedTagIds);
     }
     handleClose();
   }
   ```

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add app/(modals)/add-task.tsx
git commit -m "feat(tags): replace categories with tags in add-task modal"
```

---

### Task 7: Replace categories with tags in edit-task screen

**Files:**
- Modify: `app/(screens)/edit-task.tsx`

**Step 1: Update the screen**

Same pattern as Task 6:
1. Remove `CATEGORIES`/`Category` imports
2. Replace category state with tag state
3. Import `TagChipPicker` and `useTaskTags`
4. Load existing task tags in useEffect:
   ```typescript
   const { getTagsForTask, setTaskTags } = useTaskTags();
   // In useEffect:
   setSelectedTagIds(getTagsForTask(task.id).map((t) => t.id));
   ```
5. Replace CATEGORY input group with TAGS TagChipPicker
6. In `handleSave`, update tags after task update:
   ```typescript
   await setTaskTags(id as string, selectedTagIds);
   ```
7. Remove `category` from the `updateTask` call

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add app/(screens)/edit-task.tsx
git commit -m "feat(tags): replace categories with tags in edit-task screen"
```

---

## Phase 3: Mobile UI — Display & Filtering

### Task 8: Replace category badge with tag chips on TaskCard

**Files:**
- Modify: `components/TaskCard.tsx`

**Step 1: Update TaskCard**

1. Add `tags` prop:
   ```typescript
   interface TaskCardProps {
     task: Task;
     project?: Project | null;
     tags?: Tag[];
     onStart: (id: string) => void;
     onPause: (id: string) => void;
     onComplete: (id: string) => void;
     onDelete: (id: string) => void;
   }
   ```
2. Import `Tag` from `@/lib/supabase`
3. Replace the category badge section. Where it currently shows:
   ```tsx
   <View style={styles.categoryBadge}>
     <Text style={styles.categoryText}>{task.category || 'Task'}</Text>
   </View>
   ```
   Replace with tag chips (show up to 3, then "+N"):
   ```tsx
   {tags && tags.length > 0 ? (
     <View style={{ flexDirection: 'row', gap: 4 }}>
       {tags.slice(0, 3).map((tag) => (
         <View key={tag.id} style={[styles.tagBadge, { backgroundColor: `${tag.color}20`, borderColor: tag.color }]}>
           <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
         </View>
       ))}
       {tags.length > 3 && (
         <View style={styles.tagOverflow}>
           <Text style={styles.tagOverflowText}>+{tags.length - 3}</Text>
         </View>
       )}
     </View>
   ) : (
     <View style={styles.categoryBadge}>
       <Text style={styles.categoryText}>{task.category || 'Task'}</Text>
     </View>
   )}
   ```
4. Add styles for tagBadge, tagText, tagOverflow, tagOverflowText. Tag badges: small (paddingHorizontal 8, paddingVertical 3, borderRadius 6, borderWidth 1).

**Step 2: Verify types compile**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add components/TaskCard.tsx
git commit -m "feat(tags): replace category badge with tag chips on TaskCard"
```

---

### Task 9: Replace category filtering with tag filtering in FilterBar and Tasks tab

**Files:**
- Modify: `components/FilterBar.tsx`
- Modify: `app/(tabs)/index.tsx`

**Step 1: Update FilterBar**

1. Replace category filter props with tag filter props:
   ```typescript
   interface FilterBarProps {
     tags: Tag[];
     selectedTagIds: Set<string>;
     onTagToggle: (tagId: string) => void;
     sortBy: SortOption;
     onSortChange: (sort: SortOption) => void;
     itemCount: number;
     projects: Project[];
     selectedProjectId: string | null;
     onProjectChange: (projectId: string | null) => void;
   }
   ```
2. Import `Tag` from `@/lib/supabase`
3. Replace category pills with tag pills:
   ```tsx
   {/* Tag Filter Pills */}
   <View style={styles.filterRow}>
     <Ionicons name="pricetag-outline" size={14} color={Colors.textMuted} />
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
       <Pressable
         onPress={() => { /* clear all tag filters */ }}
         style={[styles.pill, selectedTagIds.size === 0 && styles.pillActive]}>
         <Text style={[styles.pillText, selectedTagIds.size === 0 && styles.pillTextActive]}>All</Text>
       </Pressable>
       {tags.map((tag) => {
         const isActive = selectedTagIds.has(tag.id);
         return (
           <Pressable
             key={tag.id}
             onPress={() => onTagToggle(tag.id)}
             style={[styles.pill, isActive && { backgroundColor: tag.color || Colors.primary, borderColor: tag.color || Colors.primary }]}>
             <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{tag.name}</Text>
           </Pressable>
         );
       })}
     </ScrollView>
   </View>
   ```

**Step 2: Update Tasks tab (`app/(tabs)/index.tsx`)**

1. Import `useTags` and `useTaskTags`:
   ```typescript
   import { useTags } from '@/contexts/TagsContext';
   import { useTaskTags } from '@/contexts/TaskTagsContext';
   ```
2. Get data from contexts:
   ```typescript
   const { tags } = useTags();
   const { getTagsForTask } = useTaskTags();
   ```
3. Replace `selectedCategories` state with `selectedTagIds`:
   ```typescript
   const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
   ```
4. Update `processedTasks` — replace category filtering with tag filtering:
   ```typescript
   // Filter by selected tags
   if (selectedTagIds.size > 0) {
     result = result.filter((t) => {
       const taskTags = getTagsForTask(t.id);
       return taskTags.some((tag) => selectedTagIds.has(tag.id));
     });
   }
   ```
5. Remove category filter code
6. Update FilterBar props:
   ```tsx
   <FilterBar
     tags={tags}
     selectedTagIds={selectedTagIds}
     onTagToggle={handleTagToggle}
     sortBy={sortBy}
     onSortChange={setSortBy}
     itemCount={processedTasks.length}
     projects={projects}
     selectedProjectId={selectedProjectId}
     onProjectChange={setSelectedProjectId}
   />
   ```
7. Add `handleTagToggle`:
   ```typescript
   const handleTagToggle = (tagId: string) => {
     setSelectedTagIds((prev) => {
       const next = new Set(prev);
       if (next.has(tagId)) next.delete(tagId);
       else next.add(tagId);
       return next;
     });
   };
   ```
8. Pass tags to every TaskCard:
   ```tsx
   tags={getTagsForTask(item.id)}
   ```

**Step 3: Verify types compile**

Run: `npm run typecheck`

**Step 4: Commit**

```bash
git add components/FilterBar.tsx app/(tabs)/index.tsx
git commit -m "feat(tags): replace category filtering with tag filtering"
```

---

## Phase 4: Mobile UI — Management & Tabs

### Task 10: Create Tags management screen

**Files:**
- Create: `app/(screens)/tags.tsx`
- Modify: `app/(screens)/_layout.tsx`

**Step 1: Register the route**

In `app/(screens)/_layout.tsx`, add:
```tsx
<Stack.Screen name="tags" />
```

**Step 2: Create the screen**

Same pattern as `app/(screens)/projects.tsx`: header with back button + title + add button, inline form (name + color picker using PROJECT_COLORS), FlatList of tag cards with edit/delete actions.

Use `useTags()` from context.

**Step 3: Verify types compile**

Run: `npm run typecheck`

**Step 4: Commit**

```bash
git add app/(screens)/tags.tsx app/(screens)/_layout.tsx
git commit -m "feat(tags): create tags management screen"
```

---

### Task 11: Restructure mobile tabs (Tasks, Projects, Insights)

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/projects.tsx`
- Modify: `components/FloatingTabBar.tsx`
- Modify: `app/(tabs)/index.tsx` — remove projects button from header (now a tab)

**Step 1: Create the projects tab screen**

Create `app/(tabs)/projects.tsx` — this is a thin wrapper that renders the projects management content. Copy the content from `app/(screens)/projects.tsx` but without the back button (since it's a tab, not a pushed screen). OR simply reuse the screen content by extracting a shared component.

Simplest approach: the projects tab shows the same content as the projects screen but with a different header (no back button, just title + add button).

**Step 2: Update tab layout**

In `app/(tabs)/_layout.tsx`, add the projects tab:
```tsx
<Tabs.Screen name="index" options={{ title: 'Tasks' }} />
<Tabs.Screen name="projects" options={{ title: 'Projects' }} />
<Tabs.Screen name="analytics" options={{ title: 'Insights' }} />
```

**Step 3: Update FloatingTabBar**

Update the TABS array to include 3 tabs:
```typescript
const TABS = [
  {
    name: 'index',
    route: 'index',
    icon: { focused: 'list', unfocused: 'list-outline' },
    label: 'Tasks',
  },
  {
    name: 'projects',
    route: 'projects',
    icon: { focused: 'folder', unfocused: 'folder-outline' },
    label: 'Projects',
  },
  {
    name: 'analytics',
    route: 'analytics',
    icon: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
    label: 'Insights',
  },
];
```

Update the render to map over all tabs with the FAB between the first and second:
```tsx
<TabButton ... TABS[0] ... focused={state.index === 0} />
<TabButton ... TABS[1] ... focused={state.index === 1} />
<AddTabButton onPress={() => router.push('/add-task')} />
<TabButton ... TABS[2] ... focused={state.index === 2} />
```

**Step 4: Remove projects button from Tasks tab header**

In `app/(tabs)/index.tsx`, remove the projects button Pressable from `headerActions` since Projects is now a tab.

**Step 5: Verify types compile**

Run: `npm run typecheck`

**Step 6: Commit**

```bash
git add app/(tabs)/_layout.tsx app/(tabs)/projects.tsx components/FloatingTabBar.tsx app/(tabs)/index.tsx
git commit -m "feat(tabs): restructure to 3 tabs (Tasks, Projects, Insights)"
```

---

### Task 12: Add navigation to Tags screen from Tasks tab header

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Add Tags button**

In the header actions, add a tags button (replacing where the projects button was):
```tsx
<Pressable onPress={() => router.push('/tags')} style={styles.tagsButton}>
  <Ionicons name="pricetag-outline" size={22} color={Colors.text} />
</Pressable>
```

Style: same as the old projects button (44x44, rounded 22, backgroundSecondary).

**Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat(tags): add tags navigation button to task list header"
```

---

## Phase 5: Web Implementation

### Task 13: Update web FilterBar for tags

**Files:**
- Modify: `web/components/FilterBar.tsx`

**Step 1: Update FilterBar props and rendering**

Replace category-based filtering with tag-based:

```typescript
import { Tag } from '@shared/types';

interface FilterBarProps {
  tags: Tag[];
  selectedTagIds: Set<string>;
  onTagToggle: (tagId: string) => void;
  onClearFilters: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}
```

Replace category buttons with tag buttons. Each tag button uses its `tag.color` when active.

**Step 2: Commit**

```bash
git add web/components/FilterBar.tsx
git commit -m "feat(tags): update web FilterBar for tag filtering"
```

---

### Task 14: Update web TaskCard for tags

**Files:**
- Modify: `web/components/TaskCard.tsx`

**Step 1: Add tags prop and display**

Add `tags?: Tag[]` prop. Replace the category badge:
```tsx
<span className="shrink-0 rounded-full bg-background-tertiary px-2.5 py-0.5 text-xs capitalize text-text-secondary">
  {task.category}
</span>
```

With tag chips (up to 3):
```tsx
{tags && tags.length > 0 ? (
  tags.slice(0, 3).map((tag) => (
    <span key={tag.id} className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
      {tag.name}
    </span>
  ))
) : (
  <span className="shrink-0 rounded-full bg-background-tertiary px-2.5 py-0.5 text-xs capitalize text-text-secondary">
    {task.category}
  </span>
)}
```

**Step 2: Commit**

```bash
git add web/components/TaskCard.tsx
git commit -m "feat(tags): update web TaskCard to show tag chips"
```

---

### Task 15: Update web AddTaskModal and EditTaskContent for tags

**Files:**
- Modify: `web/components/AddTaskModal.tsx`
- Modify: `web/components/EditTaskContent.tsx`

**Step 1: Update AddTaskModal**

Replace CATEGORIES usage with tag chips (multi-select). The web doesn't have context providers — fetch tags directly from Supabase in the component.

1. Fetch tags: `supabase.from('tags').select('*').eq('user_id', userId)`
2. Replace category pills with tag chips (multi-select, colored)
3. After task creation, insert task_tags rows
4. Remove `category` from the task insert

**Step 2: Update EditTaskContent**

Same pattern:
1. Fetch tags and current task's tag assignments
2. Replace category section with tag chips
3. On save, update task_tags (delete + insert)
4. Remove `category` from the task update

**Step 3: Commit**

```bash
git add web/components/AddTaskModal.tsx web/components/EditTaskContent.tsx
git commit -m "feat(tags): replace categories with tags in web task forms"
```

---

### Task 16: Update web TasksPageContent for tag filtering and data

**Files:**
- Modify: `web/components/TasksPageContent.tsx`

**Step 1: Update TasksPageContent**

1. Replace `selectedCategories` with `selectedTagIds`:
   ```typescript
   const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
   ```
2. Fetch tags and task_tags from Supabase (alongside tasks fetch)
3. Build `tagsByTaskId` map
4. Update `filterTasks` to filter by tags instead of categories
5. Pass `tags` to each `<TaskCard>`
6. Update FilterBar props

**Step 2: Commit**

```bash
git add web/components/TasksPageContent.tsx
git commit -m "feat(tags): wire tag filtering into web tasks page"
```

---

### Task 17: Add Tags management page to web + Sidebar nav

**Files:**
- Create: `web/app/(app)/tags/page.tsx`
- Modify: `web/components/Sidebar.tsx`

**Step 1: Create tags management page**

A simple page with tag CRUD (list, create form with name + color, edit, delete). Style with Tailwind matching existing pages.

**Step 2: Add Tags to Sidebar**

Add to `navItems` array:
```typescript
{ href: '/tags', label: 'Tags', icon: Tag },
```

Import `Tag` icon from lucide-react.

**Step 3: Commit**

```bash
git add web/app/(app)/tags/page.tsx web/components/Sidebar.tsx
git commit -m "feat(tags): add tags management page and sidebar nav to web"
```

---

### Task 18: Export Tag type from shared types

**Files:**
- Check: `shared/types/index.ts` or wherever web imports types from

Ensure web can import `Tag` type. The web uses `@shared/types` which maps to `shared/types/`. Make sure `Tag` is exported from there.

If `shared/types/index.ts` exists, add:
```typescript
export type { Tag } from './supabase';
```

Or if web imports directly from `shared/types/supabase.ts`, extract the Tag type helper similarly to how Task is exported.

**Step 1: Commit**

```bash
git add shared/types/
git commit -m "feat(tags): export Tag type from shared types"
```

---

## Phase 6: Cleanup

### Task 19: Lint, format, typecheck

**Step 1: Run lint on changed files**

Run: `npx eslint [all changed files]`

**Step 2: Run prettier**

Run: `npm run format`

**Step 3: Final typecheck**

Run: `npm run typecheck`

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix lint and formatting"
```

---

## Summary

19 tasks across 6 phases:
- **Phase 1** (Tasks 1-4): Shared data layer — types, hooks, contexts
- **Phase 2** (Tasks 5-7): Mobile tag assignment in task forms
- **Phase 3** (Tasks 8-9): Mobile display and filtering
- **Phase 4** (Tasks 10-12): Mobile management screen + tab restructuring
- **Phase 5** (Tasks 13-18): Web implementation (mirror all mobile changes)
- **Phase 6** (Task 19): Cleanup
