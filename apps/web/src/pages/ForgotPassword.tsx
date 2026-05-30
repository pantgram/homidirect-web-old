import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/api/auth";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

type ResetStep = "email" | "token" | "password" | "success";

const ForgotPassword = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;

    try {
      await authApi.forgotPassword({ email: emailValue });
      setEmail(emailValue);
      setCurrentStep("token");
      toast({
        title: t("auth.resetLinkSent"),
        description: t("auth.resetLinkSentDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error") || "Error",
        description: error.response?.data?.message || t("auth.resetRequestFailed") || "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const tokenValue = formData.get("token") as string;

    if (!tokenValue || tokenValue.trim().length === 0) {
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.tokenRequired") || "Please enter the token from your email",
        variant: "destructive",
      });
      return;
    }

    setToken(tokenValue.trim());
    setCurrentStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      setCurrentStep("success");
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

  const handleResendToken = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast({
        title: t("auth.resetLinkSent"),
        description: t("auth.resetLinkSentDesc"),
      });
    } catch (error: any) {
      toast({
        title: t("auth.error") || "Error",
        description: error.response?.data?.message || t("auth.resetRequestFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("email");
    setEmail("");
    setToken("");
  };

  const handleBack = () => {
    if (currentStep === "token") {
      setCurrentStep("email");
    } else if (currentStep === "password") {
      setCurrentStep("token");
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "email":
        return t("auth.forgotPassword");
      case "token":
        return t("auth.enterToken");
      case "password":
        return t("auth.resetPassword");
      case "success":
        return t("auth.passwordResetSuccess");
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "email":
        return t("auth.forgotPasswordDesc");
      case "token":
        return t("auth.enterTokenDesc");
      case "password":
        return t("auth.resetPasswordDesc");
      case "success":
        return t("auth.passwordResetSuccessDesc");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
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
        );

      case "token":
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("auth.tokenSentTo")} <strong>{email}</strong>
              </p>
            </div>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">{t("auth.resetToken")}</Label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder={t("auth.tokenPlaceholder")}
                  required
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full">
                {t("auth.verifyToken")}
              </Button>
            </form>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendToken}
                disabled={isLoading}
              >
                {isLoading ? t("auth.sending") : t("auth.resendToken")}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleStartOver}
              >
                {t("auth.tryAnotherEmail")}
              </Button>
            </div>
          </div>
        );

      case "password":
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
        );

      case "success":
        return (
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
        );
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {currentStep === "email" ? (
            <Link
              to="/auth"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.backToLogin")}
            </Link>
          ) : currentStep !== "success" ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.back")}
            </button>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{getStepTitle()}</CardTitle>
              <CardDescription>
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;
