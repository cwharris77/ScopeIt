'use client';

import dynamic from 'next/dynamic';

const SettingsContent = dynamic(
  () => import('@/components/SettingsContent').then((mod) => mod.default),
  { ssr: false }
);

export default function SettingsPage() {
  return <SettingsContent />;
}
