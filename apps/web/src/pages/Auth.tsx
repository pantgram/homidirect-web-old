import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getApiError } from "@/api";
import { env } from "@/config/env";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    
    if (error === "account_exists") {
      toast({
        title: t("auth.error"),
        description: t("auth.googleAccountExists"),
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    } else if (error === "auth_failed") {
      toast({
        title: t("auth.error"),
        description: t("auth.googleAuthFailed"),
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  }, [location.search, t, navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = `${env.apiUrl}/api/v1/auth/google`;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.welcomeBackMsg"),
      });

      const state = location.state as {
        returnTo?: string;
        action?: string;
      } | null;
      if (state?.returnTo) {
        navigate(state.returnTo, { state: { action: state.action } });
      } else {
        navigate("/");
      }
    } catch (error) {
      const errorMessage = getApiError(error).message || t("auth.loginFailed");
      toast({
        title: t("auth.error") || "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const isTenant = formData.get("tenant") === "on";
    const isPropertyOwner = formData.get("propertyOwner") === "on";

    if (password !== confirmPassword) {
      setIsLoading(false);
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.passwordMismatch") || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      setIsLoading(false);
      toast({
        title: t("auth.error") || "Error",
        description:
          t("auth.passwordTooShort") ||
          "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (!isTenant && !isPropertyOwner) {
      setIsLoading(false);
      toast({
        title: t("auth.roleRequired"),
        description: t("auth.roleRequiredMsg"),
        variant: "destructive",
      });
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

    const role = isTenant && isPropertyOwner ? "BOTH" : isPropertyOwner ? "LANDLORD" : "TENANT";

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      toast({
        title: t("auth.accountCreated"),
        description: t("auth.welcomeMsg"),
      });

      const state = location.state as {
        returnTo?: string;
        action?: string;
      } | null;
      if (state?.returnTo) {
        navigate(state.returnTo, { state: { action: state.action } });
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({
        title: t("auth.error") || "Error",
        description: getApiError(error).message || t("auth.signupFailed"),
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signup")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t("auth.welcomeBack")}</CardTitle>
                  <CardDescription>{t("auth.loginDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} noValidate className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t("auth.email")}</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">
                          {t("auth.password")}
                        </Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          {t("auth.forgotPasswordLink")}
                        </Link>
                      </div>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t("auth.orContinueWith")}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {t("auth.googleSignIn")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>{t("auth.createAccount")}</CardTitle>
                  <CardDescription>{t("auth.signupDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSignup}
                    noValidate
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">
                        {t("auth.password")}
                      </Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">
                        {t("auth.confirmPassword")}
                      </Label>
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>{t("auth.iAmA")}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="tenant" name="tenant" className="rounded-none"/>
                          <label
                            htmlFor="tenant"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t("auth.tenant")}
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="propertyOwner" name="propertyOwner" className="rounded-none"/>
                          <label
                            htmlFor="propertyOwner"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t("auth.propertyOwner")}
                          </label>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? t("auth.creatingAccount")
                        : t("auth.signUpButton")}
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t("auth.orContinueWith")}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {t("auth.googleSignUp")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
