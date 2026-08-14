import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { toast } from "@/lib/toast";
import { PageLoader } from "@/components/layout/PageLoader";

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
  messageKey?: TranslationKey;
}

export function RequireAuth({
  children,
  redirectTo = "/auth",
  messageKey,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: messageKey ? t(messageKey) : t("auth.login"),
        description: messageKey
          ? undefined
          : t("auth.loginDesc"),
        variant: "destructive",
      });
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, t, messageKey]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
