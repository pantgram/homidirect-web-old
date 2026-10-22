import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  Home,
  Key,
  Pencil,
} from "lucide-react";
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
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader, ConfirmDialog } from "@/components/shared";
import { formatDate } from "@/utils/format";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users";
import { authApi } from "@/api/auth";
import { supabase } from "@/lib/supabase";
import { getApiError } from "@/api/client";
import type { UserRole } from "@/types";

const MyProfile = () => {
  const { t, locale } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isTenant, setIsTenant] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setIsTenant(user.role === "TENANT" || user.role === "BOTH");
      setIsLandlord(user.role === "LANDLORD" || user.role === "BOTH");
    }
  }, [user]);

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

  const handleSaveChanges = async () => {
    if (!user) return;

    const selectedRole = getSelectedRole();
    setIsSaving(true);
    try {
      // Supabase auth.users is the source of truth; the backend only mirrors
      // it via POST /auth/sync (reads snake_case claims from user_metadata).
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          ...(user.role !== "ADMIN" ? { role: selectedRole } : {}),
        },
      });
      if (error) throw error;
      await authApi.syncProfile();
      setIsEditingRole(false);
      toast({
        title: t("profile.updateSuccess"),
      });
      window.location.reload();
    } catch (err) {
      const apiError = getApiError(err);
      toast({
        title: t("profile.updateError"),
        description: apiError.message || undefined,
        variant: "destructive",
      });
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
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const hasChanges =
    user &&
    (firstName !== user.firstName ||
      lastName !== user.lastName ||
      getSelectedRole() !== user.role);

  return (
    <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {user!.firstName} {user!.lastName}
                  </CardTitle>
                  <CardDescription>{user!.email}</CardDescription>
                </div>
                {getRoleBadge(user!.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("profile.memberSince")}:{" "}
                  {formatDate(user!.createdAt, locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

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
                  value={user?.email ?? ""}
                  disabled
                  placeholder={t("profile.email")}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("profile.role")}</Label>
                  {user!.role !== "ADMIN" && !isEditingRole && (
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
                {isEditingRole && user!.role !== "ADMIN" ? (
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
                  <div className="pt-1">{getRoleBadge(user!.role)}</div>
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
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t("profile.deleteConfirmTitle")}
          description={t("profile.deleteConfirmDesc")}
          onConfirm={handleDeleteAccount}
          confirmLabel={t("profile.deleteAccount")}
          destructive
          isLoading={isDeleting}
        />
      </PageLayout>
  );
};

export default MyProfile;
