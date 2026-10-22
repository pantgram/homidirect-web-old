import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const finish = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: t("auth.error"),
          description: t("auth.loginFailed"),
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
        return;
      }

      window.location.replace("/");
    };

    finish();
  }, [navigate, t]);

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
