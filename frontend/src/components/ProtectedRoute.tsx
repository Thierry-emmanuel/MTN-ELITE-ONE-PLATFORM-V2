import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

type StoredUser = { role: string } | null;

function getStoredUser(): StoredUser {
  try {
    const raw = localStorage.getItem('mtn_user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required role(s) — if omitted, any authenticated user is accepted */
  roles?: string[];
  /** Where to redirect when not authenticated */
  redirectTo?: string;
}

/**
 * ProtectedRoute — wraps a route element and redirects to /login if:
 *  - there is no stored token/user (not authenticated), OR
 *  - the user's role is not in the allowed roles list
 *
 * Note: this is a client-side guard only. The backend enforces real
 * authorization via JwtAuthGuard + RolesGuard on every protected endpoint.
 */
export const ProtectedRoute = ({
  children,
  roles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const token = localStorage.getItem('mtn_token');
  const user  = getStoredUser();

  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Authenticated but wrong role — send to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
