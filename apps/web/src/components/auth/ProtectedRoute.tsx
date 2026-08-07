import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireLandlord } from "@/components/auth/RequireRole";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Require the LANDLORD/BOTH/ADMIN role in addition to authentication. */
  requireLandlord?: boolean;
  /** Where to send unauthenticated users (defaults to "/auth"). */
  authRedirectTo?: string;
  /** Where to send authenticated non-landlord users. */
  landlordRedirectTo?: string;
}

/**
 * Route-level guard. Use as the `element` of a protected <Route> so that auth
 * gating lives in the router instead of inside each page component.
 */
export function ProtectedRoute({
  children,
  requireLandlord = false,
  authRedirectTo,
  landlordRedirectTo,
}: ProtectedRouteProps) {
  return (
    <RequireAuth redirectTo={authRedirectTo}>
      {requireLandlord ? (
        <RequireLandlord redirectTo={landlordRedirectTo}>{children}</RequireLandlord>
      ) : (
        children
      )}
    </RequireAuth>
  );
}
