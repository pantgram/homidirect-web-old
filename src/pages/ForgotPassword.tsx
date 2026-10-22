import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/api/auth";
import { getApiError } from "@/api";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;

    try {
      await authApi.forgotPassword(emailValue);
      setEmail(emailValue);
      setIsSent(true);
      toast({
        title: t("auth.resetLinkSent"),
        description: t("auth.resetLinkSentDesc"),
      });
    } catch (error) {
      toast({
        title: t("auth.error") || "Error",
        description: getApiError(error).message || t("auth.resetRequestFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast({
        title: t("auth.resetLinkSent"),
        description: t("auth.resetLinkSentDesc"),
      });
    } catch (error) {
      toast({
        title: t("auth.error") || "Error",
        description: getApiError(error).message || t("auth.resetRequestFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <CardTitle>
                {isSent ? t("auth.resetLinkSent") : t("auth.forgotPassword")}
              </CardTitle>
              <CardDescription>
                {isSent ? t("auth.resetLinkSentDesc") : t("auth.forgotPasswordDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.tokenSentTo")} <strong>{email}</strong>
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleResend}
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading ? t("auth.sending") : t("auth.resendToken")}
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/auth">{t("auth.backToLogin")}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;
