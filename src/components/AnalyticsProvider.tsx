'use client';

import { useEffect } from 'react';
import { initWebVitalsAnalytics } from '@/lib/analytics';

export default function AnalyticsProvider() {
  useEffect(() => {
    initWebVitalsAnalytics();
  }, []);

  return null;
}

