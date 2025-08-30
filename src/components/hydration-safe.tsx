"use client";

import React, { useState, useEffect } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Hydration-safe wrapper component that prevents hydration mismatches
 * between server and client rendering by only rendering children after
 * the component has mounted on the client.
 */
export function HydrationSafe({ children, fallback }: HydrationSafeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div style={{ visibility: 'hidden' }}>{children}</div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if component is mounted (client-side only)
 */
export function useHydrationSafe() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
