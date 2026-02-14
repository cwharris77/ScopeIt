'use client';

import dynamic from 'next/dynamic';

const TasksPageContent = dynamic(
  () => import('@/components/TasksPageContent').then((mod) => mod.TasksPageContent),
  { ssr: false }
);

export default function TasksPage() {
  return <TasksPageContent />;
}
