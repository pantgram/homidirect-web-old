import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        t("auth.loginFailed") ||
        "Login failed";
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setIsLoading(false);
      toast({
        title: t("auth.error") || "Error",
        description: t("auth.passwordMismatch") || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
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

    // Parse full name into first and last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

    // Determine role - LANDLORD if property owner, TENANT otherwise
    const role = isPropertyOwner ? "LANDLORD" : "TENANT";

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
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("auth.error") || "Error",
        description:
          error.response?.data?.message ||
          t("auth.signupFailed") ||
          "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
                        //placeholder="your@email.com"
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
                        //placeholder="••••••••"
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
                       // placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                       // placeholder="your@email.com"
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
                       // placeholder="••••••••"
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
                       // placeholder="••••••••"
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
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
