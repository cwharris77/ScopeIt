'use client';

import dynamic from 'next/dynamic';

const DeleteAccountContent = dynamic(
  () => import('@/components/DeleteAccountContent').then((mod) => mod.default),
  { ssr: false }
);

export default function DeleteAccountPage() {
  return <DeleteAccountContent />;
}
