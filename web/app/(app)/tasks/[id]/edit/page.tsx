'use client';

import dynamic from 'next/dynamic';

const EditTaskContent = dynamic(() => import('@/components/EditTaskContent'), { ssr: false });

export default function EditTaskPage() {
  return <EditTaskContent />;
}
