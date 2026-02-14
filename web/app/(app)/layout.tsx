'use client';

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar').then((mod) => mod.Sidebar), {
  ssr: false,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
