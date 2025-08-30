"use client";

import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-only wrapper that prevents server-side rendering
 * of components that depend on browser APIs or state
 */
export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
