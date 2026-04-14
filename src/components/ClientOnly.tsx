import { useState, useEffect, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  /**
   * Optional fallback to render on the server and during hydration.
   * Defaults to null (renders nothing until client mounts).
   */
  fallback?: ReactNode;
}

/**
 * ClientOnly - A hydration guard component.
 * 
 * Renders nothing (or a fallback) on the server and during initial hydration,
 * then renders children once the client has mounted. This prevents hydration
 * mismatches for components that depend on localStorage or other client-only APIs.
 * 
 * Usage:
 * ```tsx
 * <ClientOnly fallback={<LoadingSpinner />}>
 *   <ComponentThatUsesLocalStorage />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook version for conditional rendering within a component.
 * Returns true only after the component has mounted on the client.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

export default ClientOnly;
