# Estimation Trends — Design Document

## Problem

The analytics page shows estimation accuracy as a single snapshot number. Users can't see whether they're improving over time — which is the core value proposition of "master your estimation."

## Solution

Add an "Accuracy Trend" line chart to the analytics page (web first, mobile later) with two togglable views: weekly average and per-task rolling average.

## Data Source

All completed tasks from the `tasks` table. No new database tables needed — accuracy is computed client-side using the existing `calculatePerTaskAccuracy` function from `shared/utils/accuracy.ts`.

## Chart Views

### Weekly View (default)

- Group completed tasks by ISO week
- For each week with at least 1 completed task, calculate accuracy %
- X-axis: week start dates (e.g., "Feb 3", "Feb 10")
- Y-axis: 0–100%

### Rolling View

- Calculate a rolling average of per-task accuracy over a window of 10 tasks
- Each completed task is a data point
- X-axis: completion date
- Y-axis: 0–100% rolling accuracy

### Toggle

Segmented control / pill toggle above the chart: "Weekly" | "Rolling". Default to weekly.

## Visual Treatment

- Line chart (Recharts `LineChart` on web)
- Primary teal (`#087f8c`) for the trend line
- Dashed gray reference line at the user's overall accuracy average
- Same dark theme styling as the existing performance bar chart
- Tooltip showing the date/week and accuracy value

## Placement

On the analytics page, between the stat cards and the "Recent Performance" bar chart:

1. Stats cards (existing)
2. **Accuracy Trend (new)**
3. Recent Performance bar chart (existing)
4. AI Insights (existing)

## Scope

- Web only for now (Recharts)
- Mobile can be added later with a React Native chart library
- No backend changes needed
