# ScopeIt Web App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a separate Next.js web app with shared constants/types, and remove Tamagui from the mobile app.

**Architecture:** A `shared/` directory holds platform-agnostic code (constants, types, utils). The existing Expo app and the new `web/` Next.js app both import from `shared/`. Each app has its own Supabase client, UI components, and routing.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, @supabase/ssr, lucide-react, recharts

---

## Phase 1: Remove Tamagui from Mobile App

### Task 1: Replace Tamagui in Loading.tsx

**Files:**
- Modify: `components/Loading.tsx`

**Step 1: Replace Spinner with ActivityIndicator**

Replace the entire file contents with:

```tsx
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Loading() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#087f8c" />
    </SafeAreaView>
  );
}
```

**Step 2: Verify the app still loads**

Run: `npm run typecheck`
Expected: No errors related to Loading.tsx

**Step 3: Commit**

```bash
git add components/Loading.tsx
git commit -m "refactor: replace Tamagui Spinner with React Native ActivityIndicator"
```

---

### Task 2: Replace Tamagui in Timer.tsx

**Files:**
- Modify: `components/Timer.tsx`

**Step 1: Rewrite Timer with React Native core + NativeWind**

The current Timer uses `XStack`, `YStack`, `Text`, `Input`, `Button` from Tamagui and `Play`/`Pause` from `@tamagui/lucide-icons`. Replace with `View`, `Text`, `TextInput`, `Pressable` from React Native and use simple unicode icons (or Ionicons from `@expo/vector-icons` if already installed).

Replace the entire file with:

```tsx
import { Task } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type TimerProps = {
  task: Task;
  onUpdate: (updates: Partial<Task>, immediate?: boolean) => void;
};

export function Timer({ task, onUpdate }: TimerProps) {
  const [now, setNow] = useState(Date.now());
  const isRunning = !!task.started_at;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleToggle = () => {
    if (isRunning) {
      const start = new Date(task.started_at!).getTime();
      const delta = Math.floor((Date.now() - start) / 1000);
      onUpdate({ actual_seconds: (task.actual_seconds || 0) + delta, started_at: null }, true);
    } else {
      onUpdate({ started_at: new Date().toISOString() }, true);
    }
  };

  const getElapsedSeconds = () => {
    const base = task.actual_seconds || 0;
    if (!isRunning) return base;
    const start = new Date(task.started_at!).getTime();
    return base + Math.floor((now - start) / 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      {/* Estimate */}
      <View className="flex-1 gap-1">
        <Text className="text-xs font-bold text-gray-400">ESTIMATE (MIN)</Text>
        <TextInput
          className="text-base text-white p-0"
          value={task.estimated_minutes?.toString()}
          onChange={(e) => {
            const val = parseInt(e.nativeEvent.text) || 0;
            onUpdate({ estimated_minutes: val });
          }}
          keyboardType="numeric"
        />
      </View>

      {/* Play/Pause */}
      <Pressable
        onPress={handleToggle}
        className={`w-16 h-16 rounded-full items-center justify-center ${isRunning ? 'bg-orange-500' : 'bg-green-500'}`}
      >
        <Text className="text-white text-2xl">{isRunning ? '⏸' : '▶'}</Text>
      </Pressable>

      {/* Elapsed */}
      <View className="flex-1 items-end gap-1">
        <Text className="text-xs font-bold text-gray-400">ELAPSED</Text>
        <Text className="text-2xl font-bold text-white font-mono">
          {formatTime(getElapsedSeconds())}
        </Text>
      </View>
    </View>
  );
}
```

**Step 2: Verify**

Run: `npm run typecheck`
Expected: No errors related to Timer.tsx

**Step 3: Commit**

```bash
git add components/Timer.tsx
git commit -m "refactor: replace Tamagui components in Timer with React Native core + NativeWind"
```

---

### Task 3: Remove TamaguiProvider and uninstall packages

**Files:**
- Modify: `app/_layout.tsx`
- Delete: `tamagui.config.ts`
- Delete: `lib/theme.ts`

**Step 1: Remove TamaguiProvider from layout**

In `app/_layout.tsx`:
- Remove the `import defaultConfig from '@/tamagui.config'` line
- Remove the `import { TamaguiProvider } from 'tamagui'` line
- Remove `<TamaguiProvider config={defaultConfig} defaultTheme={theme}>` and its closing tag
- Remove the `const [theme] = useState<'light' | 'dark'>('dark')` line
- Remove the `useState` import if no longer used

The `RootLayout` function should become:

```tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <RootLayoutNav />
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

And the imports should be:

```tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
```

**Step 2: Delete Tamagui config files**

Delete `tamagui.config.ts` and `lib/theme.ts`.

**Step 3: Uninstall Tamagui packages**

Run: `npm uninstall tamagui @tamagui/config @tamagui/button @tamagui/lucide-icons`

**Step 4: Verify**

Run: `npm run typecheck`
Expected: No Tamagui-related errors. Confirm no other files import from `tamagui` or `@tamagui/*`.

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove Tamagui entirely — replaced with React Native core + NativeWind"
```

---

## Phase 2: Extract Shared Code

### Task 4: Create shared directory and move constants

**Files:**
- Create: `shared/constants/tasks.ts` (copy from `constants/tasks.ts`)
- Create: `shared/constants/colors.ts` (copy from `constants/colors.ts`)
- Create: `shared/constants/layout.ts` (copy from `constants/layout.ts`)
- Create: `shared/constants/index.ts` (barrel export)
- Modify: `constants/tasks.ts` → re-export from shared
- Modify: `constants/colors.ts` → re-export from shared
- Modify: `constants/layout.ts` → re-export from shared

**Step 1: Create shared/constants**

Copy the three files from `constants/` to `shared/constants/` with identical contents.

Create `shared/constants/index.ts`:

```ts
export * from './tasks';
export * from './colors';
export * from './layout';
```

**Step 2: Make mobile constants re-export from shared**

Replace each file in `constants/` with a re-export. For example, `constants/tasks.ts` becomes:

```ts
export * from '../shared/constants/tasks';
```

Same for `constants/colors.ts` and `constants/layout.ts`.

**Step 3: Verify**

Run: `npm run typecheck`
Expected: No errors. All existing imports still work because the re-exports preserve the same API.

**Step 4: Commit**

```bash
git add shared/constants constants/
git commit -m "refactor: extract constants to shared/ with re-exports for mobile"
```

---

### Task 5: Move types and utils to shared

**Files:**
- Create: `shared/types/supabase.ts` (copy from `supabase/types.ts`)
- Create: `shared/types/task.ts` (task type helpers, extracted from `lib/supabase.ts`)
- Create: `shared/types/index.ts` (barrel export)
- Create: `shared/utils/time.ts` (copy from `utils/time.ts`)
- Create: `shared/utils/accuracy.ts` (copy from `utils/accuracy.ts`)
- Create: `shared/utils/index.ts` (barrel export)
- Modify: `utils/time.ts` → re-export from shared
- Modify: `utils/accuracy.ts` → re-export from shared

**Step 1: Create shared/types**

Copy `supabase/types.ts` to `shared/types/supabase.ts`.

Create `shared/types/task.ts` with the type helpers currently in `lib/supabase.ts`:

```ts
import { Database } from './supabase';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Task = Tables<'tasks'>;
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
```

Create `shared/types/index.ts`:

```ts
export * from './supabase';
export * from './task';
```

**Step 2: Create shared/utils**

Copy `utils/time.ts` and `utils/accuracy.ts` to `shared/utils/`. Create barrel export.

Make `utils/time.ts` and `utils/accuracy.ts` re-export from shared.

**Step 3: Update lib/supabase.ts to import types from shared**

In `lib/supabase.ts`, change:

```ts
import { Database } from '@/supabase/types';
```

to:

```ts
import { Database } from '../shared/types/supabase';
```

And keep the `Task`, `TaskInsert`, `TaskUpdate` type exports in `lib/supabase.ts` for now (they re-export from the same Database type, so existing mobile imports still work). Alternatively, re-export from shared:

```ts
export type { Task, TaskInsert, TaskUpdate } from '../shared/types/task';
```

**Step 4: Update the `generate-types` script in package.json**

Change the output path from `supabase/types.ts` to `shared/types/supabase.ts`:

```json
"generate-types": "npx supabase gen types typescript --project-id ouscsamzunholiaysnor > shared/types/supabase.ts"
```

**Step 5: Verify**

Run: `npm run typecheck`
Expected: No errors.

**Step 6: Commit**

```bash
git add shared/types shared/utils utils/ lib/supabase.ts package.json
git commit -m "refactor: extract types and utils to shared/"
```

---

### Task 6: Add @shared path alias to mobile tsconfig

**Files:**
- Modify: `tsconfig.json`

**Step 1: Add the path alias**

Add `@shared/*` path to tsconfig:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "exclude": ["supabase/functions", "web"]
}
```

Note: also add `"web"` to exclude so TypeScript doesn't check the Next.js app from the mobile tsconfig.

**Step 2: Verify**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add @shared path alias and exclude web/ from mobile tsconfig"
```

---

## Phase 3: Scaffold Next.js Web App

### Task 7: Initialize Next.js project in web/

**Step 1: Create the Next.js app**

Run from project root:

```bash
cd web && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

If `create-next-app` prompts, answer:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: `@/*`

**Step 2: Add @shared path alias to web/tsconfig.json**

After scaffolding, update `web/tsconfig.json` to add the shared alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@shared/*": ["../shared/*"]
    }
  }
}
```

(Merge this into whatever `create-next-app` generates — keep its other settings.)

Also update `web/next.config.ts` to handle the external shared imports if needed (Next.js 15 with App Router should handle `../shared` imports via tsconfig paths automatically, but verify).

**Step 3: Add Supabase dependencies**

```bash
cd web && npm install @supabase/supabase-js @supabase/ssr
```

**Step 4: Add UI dependencies**

```bash
cd web && npm install lucide-react recharts
```

**Step 5: Create web/.env.local**

```
NEXT_PUBLIC_SUPABASE_URL=<same value as EXPO_PUBLIC_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same value as EXPO_PUBLIC_SUPABASE_ANON_KEY>
```

Add `web/.env.local` to `.gitignore` if not already covered.

**Step 6: Configure Tailwind with shared colors**

In `web/tailwind.config.ts` (or the CSS file if Tailwind v4), add the theme colors from `shared/constants/colors.ts`:

```css
@theme {
  --color-background: #181922;
  --color-background-secondary: #1f2937;
  --color-primary: #087f8c;
  --color-primary-light: #0a9dae;
  --color-primary-dark: #066a75;
  --color-danger: #EF4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-low-priority: #10b981;
  --color-medium-priority: #f59e0b;
  --color-high-priority: #EF4444;
}
```

**Step 7: Verify**

```bash
cd web && npm run dev
```

Expected: Default Next.js app loads at localhost:3000.

**Step 8: Commit**

```bash
git add web/ .gitignore
git commit -m "feat: scaffold Next.js web app with Tailwind, Supabase, and shared aliases"
```

---

### Task 8: Create Supabase client for web (cookie-based)

**Files:**
- Create: `web/lib/supabase/server.ts`
- Create: `web/lib/supabase/client.ts`
- Create: `web/lib/supabase/middleware.ts`

**Step 1: Create browser client**

`web/lib/supabase/client.ts`:

```ts
import { Database } from '@shared/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client**

`web/lib/supabase/server.ts`:

```ts
import { Database } from '@shared/types/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

**Step 3: Create middleware**

`web/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 4: Create web/middleware.ts (root)**

`web/middleware.ts`:

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**Step 5: Verify**

Run: `cd web && npm run build`
Expected: Builds without errors.

**Step 6: Commit**

```bash
git add web/lib/supabase web/middleware.ts
git commit -m "feat: add Supabase cookie-based auth for Next.js (server + client + middleware)"
```

---

## Phase 4: Build Web Pages

### Task 9: Create login page

**Files:**
- Create: `web/app/login/page.tsx`

**Step 1: Build the login page**

A single-page login with email/password form and OAuth buttons (Google, GitHub). Uses the browser Supabase client.

```tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Middleware will redirect on success
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl bg-background-secondary p-8">
        <h1 className="text-3xl font-bold text-white mb-2">ScopeIt</h1>
        <p className="text-gray-400 mb-8">Master your estimation</p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-background p-3 text-white border border-gray-700 focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-background p-3 text-white border border-gray-700 focus:border-primary focus:outline-none"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary p-3 text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 border-t border-gray-700" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-700" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full rounded-lg border border-gray-700 p-3 text-white hover:bg-background transition"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full rounded-lg border border-gray-700 p-3 text-white hover:bg-background transition"
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create OAuth callback route**

Create `web/app/auth/callback/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(origin);
}
```

**Step 3: Verify**

Run: `cd web && npm run dev`, navigate to `/login`.
Expected: Login page renders with form and OAuth buttons.

**Step 4: Commit**

```bash
git add web/app/login web/app/auth
git commit -m "feat: add login page with email/password and OAuth (Google, GitHub)"
```

---

### Task 10: Create app layout with sidebar

**Files:**
- Create: `web/app/(app)/layout.tsx`
- Create: `web/components/Sidebar.tsx`
- Modify: `web/app/layout.tsx` (global layout — just html/body with font + dark bg)

**Step 1: Update global layout**

`web/app/layout.tsx` should be minimal — html, body, font, dark background, global CSS. No sidebar here (login page shouldn't have one).

**Step 2: Create Sidebar component**

`web/components/Sidebar.tsx`:

A sidebar with:
- App logo/name at top
- Nav links: Tasks (`/`), Analytics (`/analytics`)
- Active link highlighting based on pathname
- User email + sign out button at bottom

Uses `lucide-react` icons: `LayoutDashboard`, `BarChart3`, `LogOut`.

**Step 3: Create app group layout**

`web/app/(app)/layout.tsx`:

```tsx
import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

**Step 4: Move the default page to (app) group**

Move `web/app/page.tsx` → `web/app/(app)/page.tsx`

**Step 5: Verify**

Run: `cd web && npm run dev`
Expected: Sidebar visible on `/`, not visible on `/login`.

**Step 6: Commit**

```bash
git add web/app web/components/Sidebar.tsx
git commit -m "feat: add sidebar navigation layout for authenticated pages"
```

---

### Task 11: Build the tasks page (home)

**Files:**
- Create: `web/app/(app)/page.tsx` (tasks list)
- Create: `web/components/TaskCard.tsx`
- Create: `web/components/AddTaskModal.tsx`
- Create: `web/components/FilterBar.tsx`

**Step 1: Build the tasks page**

This is the main page at `/`. It should:
- Fetch tasks from Supabase for the current user (server-side initial fetch, client-side for mutations)
- Display a filter bar at top (categories + sort)
- Show active tasks and completed tasks in separate sections
- Each task shows: name, category badge, priority indicator, estimated time, elapsed time, action buttons (start/pause/complete/delete)
- "Add task" button opens a modal dialog
- Use the same filter/sort logic as the mobile app (reference `constants/tasks.ts` for categories, statuses, sort options)

**Step 2: Build TaskCard component**

Desktop-optimized task card — more horizontal, shows more info at a glance than the mobile card. Includes inline action buttons.

**Step 3: Build FilterBar component**

Horizontal bar with category pills and a sort dropdown. Same logic as mobile but styled for web.

**Step 4: Build AddTaskModal component**

A centered modal dialog (not bottom sheet) with: title input, category pills, priority selector, duration input (hours + minutes), "Create Task" button.

**Step 5: Verify**

Run: `cd web && npm run dev`
Expected: Tasks page loads, shows tasks from Supabase, filters work, can add a task.

**Step 6: Commit**

```bash
git add web/app/(app)/page.tsx web/components/TaskCard.tsx web/components/AddTaskModal.tsx web/components/FilterBar.tsx
git commit -m "feat: build tasks page with filter bar, task cards, and add task modal"
```

---

### Task 12: Build the analytics page

**Files:**
- Create: `web/app/(app)/analytics/page.tsx`
- Create: `web/components/StatsCards.tsx`
- Create: `web/components/PerformanceChart.tsx`
- Create: `web/components/AiInsights.tsx`

**Step 1: Build the analytics page**

Route: `/analytics`. Shows:
- 3 stat cards in a row: Completed count, Total time, Accuracy %
- Performance chart (last 5 completed tasks — expected vs actual bar chart using `recharts`)
- AI insights section (calls the existing `analyze-tasks` Supabase edge function)

Use `recharts` `BarChart` with `Bar` components for expected vs actual comparison. Colors: primary for expected, warning/danger for actual based on over/under.

**Step 2: Build StatsCards**

Three cards in a responsive grid. Each shows an icon (from `lucide-react`), a label, and a value.

**Step 3: Build PerformanceChart**

A `recharts` `BarChart` showing the last 5 tasks. Two bars per task: estimated (primary color) and actual (colored by accuracy — green/yellow/red).

**Step 4: Build AiInsights**

Calls the `analyze-tasks` edge function with the user's access token. Displays summary, key insights, and recommendations. Shows a loading spinner while fetching.

**Step 5: Verify**

Run: `cd web && npm run dev`, navigate to `/analytics`.
Expected: Stats, chart, and AI insights render (AI insights may show loading or error if edge function isn't running locally).

**Step 6: Commit**

```bash
git add web/app/(app)/analytics web/components/StatsCards.tsx web/components/PerformanceChart.tsx web/components/AiInsights.tsx
git commit -m "feat: build analytics page with stats, performance chart, and AI insights"
```

---

### Task 13: Build the edit task page

**Files:**
- Create: `web/app/(app)/tasks/[id]/edit/page.tsx`

**Step 1: Build the edit page**

Route: `/tasks/[id]/edit`. Shows:
- Title input
- Description textarea
- Category selector (pills)
- Priority selector
- Duration input (hours:minutes)
- Save button
- Back/cancel link

Fetches the task by ID on load. On save, updates via Supabase and redirects back to `/`.

**Step 2: Verify**

Run: `cd web && npm run dev`, navigate to `/tasks/<some-id>/edit`.
Expected: Edit form loads with task data, can save changes.

**Step 3: Commit**

```bash
git add web/app/(app)/tasks
git commit -m "feat: add task edit page"
```

---

## Phase 5: Polish & Wire Up

### Task 14: Add timer functionality to web task cards

**Files:**
- Modify: `web/components/TaskCard.tsx`

**Step 1: Add real-time timer display**

For running tasks, show a live-updating elapsed time counter (same logic as mobile Timer component). Use `setInterval` to tick every second when a task's `started_at` is set.

**Step 2: Verify**

Start a task, confirm timer ticks. Pause, confirm it stops. Complete, confirm final time is recorded.

**Step 3: Commit**

```bash
git add web/components/TaskCard.tsx
git commit -m "feat: add live timer display to web task cards"
```

---

### Task 15: Final verification and cleanup

**Step 1: Run mobile typecheck**

```bash
npm run typecheck
```

Expected: No errors.

**Step 2: Run web build**

```bash
cd web && npm run build
```

Expected: Builds successfully.

**Step 3: Run mobile lint**

```bash
npm run lint
```

Expected: No errors.

**Step 4: Test full flow**

- Sign in on web
- Create a task
- Start/pause/complete the task
- View analytics
- Edit a task
- Sign out
- Verify same data appears on mobile

**Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
