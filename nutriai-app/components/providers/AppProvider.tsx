'use client';

import { ReactNode, useEffect } from 'react';
import { ReactQueryProvider } from '../../lib/react-query/providers';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Initialize MSW in development
    if (process.env.NODE_ENV === 'development') {
      import('../../lib/msw/init').catch((error) => {
        console.error('Failed to load MSW:', error);
      });
    }
  }, []);

  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  );
}