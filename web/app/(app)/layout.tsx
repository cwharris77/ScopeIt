'use client';

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/Sidebar').then((mod) => mod.Sidebar), {
  ssr: false,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen overflow-y-auto p-8">{children}</main>
    </div>
  );
}
