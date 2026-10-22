import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/api/auth";
import { getApiError } from "@/api";
import { ArrowLeft, MailCheck } from "lucide-react";

const VerifyEmail = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      await authApi.resendVerificationEmail(email);
      toast({
        title: t("auth.verifyEmailResent"),
        description: t("auth.verifyEmailResentDesc"),
      });
    } catch (error) {
      toast({
        title: t("auth.error") || "Error",
        description:
          getApiError(error).message || t("auth.verifyEmailResendFailed"),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Link
            to="/auth"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("auth.backToLogin")}
          </Link>

          <Card>
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-center">
                {t("auth.verifyEmail")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.verifyEmailDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {email && (
                <p className="text-sm text-muted-foreground text-center">
                  {t("auth.verifyEmailSentTo")}{" "}
                  <strong className="text-foreground">{email}</strong>
                </p>
              )}
              <div className="flex flex-col gap-2">
                {email && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    <MailCheck className="mr-2 h-4 w-4" />
                    {isResending
                      ? t("auth.sending")
                      : t("auth.resendEmail")}
                  </Button>
                )}
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  {t("auth.goToLogin")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default VerifyEmail;
