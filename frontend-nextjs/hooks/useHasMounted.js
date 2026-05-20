'use client';
import { useState, useEffect } from 'react';

/**
 * Prevents React hydration mismatches for components that rely on
 * client-only state (localStorage, zustand persist, etc).
 * Usage: const mounted = useHasMounted(); if (!mounted) return null;
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
