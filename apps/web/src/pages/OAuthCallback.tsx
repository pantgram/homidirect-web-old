import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { tokenStorage } from "@/api/client";
import { useLanguage } from "@/contexts/LanguageContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      tokenStorage.setToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      window.location.replace("/");
    } else {
      toast({
        title: t("auth.error"),
        description: t("auth.loginFailed"),
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  }, [navigate, location.state, toast, t]);

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
