'use client';

import dynamic from 'next/dynamic';

const AnalyticsContent = dynamic(() => import('@/components/AnalyticsContent'), { ssr: false });

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
