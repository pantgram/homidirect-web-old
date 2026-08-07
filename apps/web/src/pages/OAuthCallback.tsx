import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/lib/toast";
import { tokenStorage } from "@/api/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiClient } from "@/api/client";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");

    if (code) {
      apiClient
        .post("/auth/google/exchange", { code })
        .then((response) => {
          const { token } = response.data;
          tokenStorage.setToken(token.access_token);
          tokenStorage.setRefreshToken(token.refresh_token);
          window.location.replace("/");
        })
        .catch(() => {
          toast({
            title: t("auth.error"),
            description: t("auth.loginFailed"),
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
        });
    } else {
      toast({
        title: t("auth.error"),
        description: t("auth.loginFailed"),
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  }, [navigate, location.search, t]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t("auth.loggingIn")}</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
