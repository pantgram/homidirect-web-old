import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/api/auth";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.invalidResetLink") || "Invalid reset link",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.passwordMismatch") || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.passwordTooShort") || "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      toast({
        title: t("auth.passwordResetSuccess"),
        description: t("auth.passwordResetSuccessDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error") || "Error",
        description: error.response?.data?.message || t("auth.resetFailed") || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.invalidResetLink")}</CardTitle>
                <CardDescription>
                  {t("auth.invalidResetLinkDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/forgot-password">
                  <Button className="w-full">
                    {t("auth.requestNewLink")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

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
              <CardTitle>{t("auth.resetPassword")}</CardTitle>
              <CardDescription>
                {t("auth.resetPasswordDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t("auth.passwordResetSuccess")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("auth.passwordResetSuccessDesc")}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    {t("auth.goToLogin")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.newPassword")}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("auth.confirmNewPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.resetting") : t("auth.resetPasswordButton")}
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

export default ResetPassword;
