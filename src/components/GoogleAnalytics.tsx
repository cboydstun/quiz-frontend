// src/components/Analytics.tsx

'use client';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      id: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Analytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const url =
        pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [GA_MEASUREMENT_ID, pathname, searchParams]);

  return null;
}
