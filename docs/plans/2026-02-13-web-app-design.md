# ScopeIt Web App — Design Document

## Problem

The existing Expo web output looks and feels like a mobile app stretched onto a desktop browser. ScopeIt targets developers and students who primarily work on desktop — they need a first-class web experience.

## Decision

Build a separate Next.js web app (`web/`) alongside the existing Expo mobile app. Share backend logic, types, and constants via a `shared/` directory. Drop Tamagui from the mobile app (barely used, broken configs).

## Project Structure

```
ScopeIt/
├── app/                    # (existing) Expo Router screens
├── components/             # (existing) React Native components
├── contexts/               # (existing) React Native contexts
├── hooks/                  # (existing) custom hooks
├── lib/                    # (existing) mobile-specific supabase client, etc.
├── shared/                 # NEW — code both apps import
│   ├── constants/          # task categories, priorities, status, colors
│   ├── types/              # supabase.ts (auto-generated), task types
│   └── utils/              # time formatting helpers
├── web/                    # NEW — Next.js app
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Web-specific UI components
│   ├── lib/                # Web supabase client (cookie-based)
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── package.json            # (existing) Expo mobile app
```

## Shared Code Strategy

**Moves to `shared/`:**
- `constants/TaskCategories.ts`, `constants/Colors.ts` — enums, arrays, color values
- `types/supabase.ts` — auto-generated Supabase types
- `types/task.ts` — task type definitions
- `utils/time.ts` — time formatting helpers

**Stays platform-specific:**
- Supabase client creation (mobile uses `expo-secure-store`, web uses `@supabase/ssr` cookies)
- All UI components
- Navigation/routing
- Auth flows

**Import aliases:**
- Both apps use `@shared/*` → `../shared/`
- Each app keeps `@/*` for its own local code

`npm run types` regenerates `shared/types/supabase.ts` — both apps pick it up automatically.

## Dropping Tamagui

Tamagui is only used in 2 mobile components:
- `Loading.tsx`: `Spinner` → `ActivityIndicator`
- `Timer.tsx`: `Button`, `Input`, `Text`, `XStack`, `YStack` → React Native core + NativeWind
- `Timer.tsx`: `Pause`/`Play` icons → `expo-vector-icons` or `lucide-react-native`

Also remove:
- `TamaguiProvider` from `app/_layout.tsx`
- `tamagui.config.ts` and `lib/theme.ts`
- Packages: `tamagui`, `@tamagui/config`, `@tamagui/button`, `@tamagui/lucide-icons`

## Web App — Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js 15 (App Router) | Latest stable, RSC, great DX |
| Styling | Tailwind CSS v4 | Native web Tailwind, same color tokens |
| Auth | `@supabase/ssr` | Cookie-based Supabase auth for Next.js |
| Icons | `lucide-react` | Same icon family, native React |
| Charts | `recharts` | Lightweight, for analytics bar chart |
| AI insights | Existing `analyze-tasks` edge function | No server-side changes needed |
| Deployment | Vercel (free tier) | One-click deploy for Next.js |

No state management library. Supabase client + RSC + `useState` for local state.

## Web App — Pages & Layout

**Layout:** Sidebar navigation with logo, nav links (Tasks, Analytics), user profile/logout at bottom. Content area fills remaining width.

**Routes:**

| Route | Mobile equivalent | Web adaptation |
|-------|------------------|----------------|
| `/login` | `(auth)/*` | Single page: email/password form + OAuth buttons |
| `/` | `(tabs)/index` | Task list with top filter bar, table or card grid layout |
| `/analytics` | `(tabs)/analytics` | Stat cards + chart + AI insights in a wider grid |
| `/tasks/[id]/edit` | `(screens)/edit-task` | Slide-over panel or dedicated page |
| Add task (modal) | `(modals)/add-task` | Centered modal dialog |

**Auth flow:** `@supabase/ssr` with cookie-based sessions. OAuth callbacks via Next.js route handlers.

## Color Tokens (shared across both apps)

```
background:       #181922
backgroundSecondary: #1f2937
primary:          #087f8c
danger:           #EF4444
low_priority:     #10b981
medium_priority:  #f59e0b
high_priority:    #EF4444
```
