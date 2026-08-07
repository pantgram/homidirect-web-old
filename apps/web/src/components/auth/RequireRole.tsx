import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import { PageLoader } from "@/components/layout/PageLoader";
import type { UserRole } from "@/types";

interface RequireRoleProps {
  children: ReactNode;
  roles: UserRole[];
  redirectTo?: string;
  messageKey?: TranslationKey;
}

const LANDLORD_ROLES: UserRole[] = ["LANDLORD", "BOTH", "ADMIN"];

export function RequireRole({
  children,
  roles,
  redirectTo = "/",
  messageKey,
}: RequireRoleProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const hasRole = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!isLoading && !hasRole) {
      toast({
        title: messageKey ? t(messageKey) : t("auth.error"),
        variant: "destructive",
      });
      navigate(redirectTo, { replace: true });
    }
  }, [hasRole, isLoading, navigate, redirectTo, t, messageKey]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!hasRole) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

export function RequireLandlord({ children, redirectTo = "/list-property-info" }: { children: ReactNode; redirectTo?: string }) {
  return (
    <RequireRole roles={LANDLORD_ROLES} redirectTo={redirectTo}>
      {children}
    </RequireRole>
  );
}
