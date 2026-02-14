# Tags Feature + Tab Restructuring Design

**Date:** 2026-02-14
**Status:** Approved
**Scope:** Replace hardcoded categories with user-defined tags (mobile + web), restructure mobile tabs

## Overview

Users can create colored tags and assign multiple tags to tasks (many-to-many). Tags replace the hardcoded category system. Mobile gets a 3-tab layout (Tasks, Projects, Insights).

## Data Layer (shared)

### New hook: `useTags()`
- State: `tags`, `loading`, `error`
- CRUD: `fetchTags()`, `addTag()`, `updateTag()`, `deleteTag()`
- Same optimistic update pattern as `useProjects`

### New hook: `useTaskTags()`
- `tagsByTaskId` — `Map<string, Tag[]>` preloaded for all user tasks
- `setTaskTags(taskId, tagIds[])` — replaces all tags for a task
- Single query: task_tags joined with tags

### Types
- `Tag`, `TagInsert`, `TagUpdate`, `TaskTag` exports in `lib/supabase.ts`

## Mobile Changes

### Tab restructuring (3 tabs)
- Tasks (list icon)
- Projects (folder icon) — promoted from header button
- Insights (chart icon)
- FAB (+) stays centered

### Tags management screen
- `(screens)/tags.tsx` — inline form (name + color picker), list with edit/delete
- Access from Settings or task list header

### Task forms (add + edit)
- Replace category pills with tag chips (tappable, multi-select)
- "+" chip to create new tag inline
- Selected tags highlighted with their color

### TaskCard
- Replace category badge with up to 3 small colored tag chips
- Overflow: "+N" indicator

### FilterBar
- Replace category pills with tag pills (multi-select)

## Web Changes

Mirror all mobile changes:
- Tag hooks/types in shared code
- Web FilterBar: tags instead of categories
- Web TaskCard: tag badges
- Web AddTaskModal/EditTaskContent: tag chips
- Tags management page: `(app)/tags/page.tsx`
- Sidebar: Tags nav item

## Removed
- Category field usage in task forms (keep constant temporarily)
- Category filter pills → tag filter pills
- Category badge on TaskCard → tag badges

## Color Presets
Reuse PROJECT_COLORS array for tag colors.
