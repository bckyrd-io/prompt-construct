import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { defaultRouteFor, useAuthStore } from '@/store/auth';
import type { UserRole } from '@/types/api';

/**
 * Auth gate for the portal screens (recommendations, dashboard, apply, payment).
 *
 * The web app has no route protection at all — `AppSidebar` renders for anyone and
 * the API decides what to return. Rather than duplicate that, this does the minimum
 * a mobile app should: bounce signed-out users to login, and send admins to their
 * own landing route instead of the client one.
 *
 * Returns `true` once it is safe to render, so callers can show a splash rather
 * than flashing protected content.
 */
export function useAuthGuard(requiredRole?: UserRole) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace(defaultRouteFor(user?.role));
    }
  }, [hasHydrated, isAuthenticated, user, requiredRole, router]);

  return hasHydrated && isAuthenticated && (!requiredRole || user?.role === requiredRole);
}