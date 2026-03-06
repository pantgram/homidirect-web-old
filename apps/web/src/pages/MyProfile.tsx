import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  Home,
  Key,
  Pencil,
  ArrowRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users";
import { getApiError } from "@/api/client";
import type { UserRole } from "@/api/types";

const MyProfile = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isTenant, setIsTenant] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      // Parse role into checkbox states
      setIsTenant(user.role === "TENANT" || user.role === "BOTH");
      setIsLandlord(user.role === "LANDLORD" || user.role === "BOTH");
    }
  }, [user]);

  // Convert checkbox states to role
  const getSelectedRole = (): UserRole => {
    if (isTenant && isLandlord) return "BOTH";
    if (isLandlord) return "LANDLORD";
    return "TENANT";
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig: Record<UserRole, { label: string; className: string }> = {
      TENANT: {
        label: t("profile.tenant"),
        className: "bg-blue-500 text-white",
      },
      LANDLORD: {
        label: t("profile.landlord"),
        className: "bg-green-500 text-white",
      },
      BOTH: {
        label: t("profile.both"),
        className: "bg-teal-500 text-white",
      },
      ADMIN: {
        label: t("profile.admin"),
        className: "bg-purple-500 text-white",
      },
    };
    const config = roleConfig[role];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "el" ? "el-GR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    const selectedRole = getSelectedRole();
    setIsSaving(true);
    try {
      await usersApi.update(user.id, {
        firstName,
        lastName,
        email,
        role: user.role !== "ADMIN" ? selectedRole : undefined,
      });
      setIsEditingRole(false);
      toast({
        title: t("profile.updateSuccess"),
      });
      // Refresh page to get updated user data
      window.location.reload();
    } catch (err) {
      const apiError = getApiError(err);
      if (
        apiError.statusCode === 409 ||
        (apiError.message && apiError.message.toLowerCase().includes("email"))
      ) {
        toast({
          title: t("profile.emailExists"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("profile.updateError"),
          variant: "destructive",
        });
      }
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await usersApi.delete(user.id);
      toast({
        title: t("profile.deleteSuccess"),
      });
      logout();
      navigate("/");
    } catch (err) {
      toast({
        title: t("profile.deleteError"),
        variant: "destructive",
      });
      console.error("Failed to delete account:", err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const hasChanges =
    user &&
    (firstName !== user.firstName ||
      lastName !== user.lastName ||
      email !== user.email ||
      getSelectedRole() !== user.role);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("profile.title")}
          </h1>
          <p className="text-muted-foreground">{t("profile.subtitle")}</p>
        </div>

        {/* Profile Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              {getRoleBadge(user.role)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {t("profile.memberSince")}: {formatDate(user.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("profile.myBookings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/bookings">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("profile.myBookings")}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Personal Information Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("profile.personalInfo")}
            </CardTitle>
            <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("profile.firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("profile.lastName")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("profile.email")}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("profile.role")}</Label>
                {user.role !== "ADMIN" && !isEditingRole && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingRole(true)}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    {t("profile.editRole")}
                  </Button>
                )}
              </div>
              {isEditingRole && user.role !== "ADMIN" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Label
                    htmlFor="role-tenant"
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isTenant
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <Checkbox
                      id="role-tenant"
                      checked={isTenant}
                      onCheckedChange={(checked) =>
                        setIsTenant(checked === true)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {t("profile.tenant")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("profile.tenantDesc")}
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="role-landlord"
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isLandlord
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <Checkbox
                      id="role-landlord"
                      checked={isLandlord}
                      onCheckedChange={(checked) =>
                        setIsLandlord(checked === true)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {t("profile.landlord")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("profile.landlordDesc")}
                      </p>
                    </div>
                  </Label>
                </div>
              ) : (
                <div className="pt-1">{getRoleBadge(user.role)}</div>
              )}
            </div>
            <div className="pt-4">
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("profile.saving")}
                  </>
                ) : (
                  t("profile.saveChanges")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("profile.dangerZone")}
            </CardTitle>
            <CardDescription>{t("profile.deleteAccountDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t("profile.deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("profile.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("profile.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("profile.deleteAccount")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default MyProfile;
