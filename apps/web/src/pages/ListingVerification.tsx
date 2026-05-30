import { useParams } from "react-router-dom";
import { Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationUpload } from "@/components/verification";
import { useListing } from "@/hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageLoader } from "@/components/layout/PageLoader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireLandlord } from "@/components/auth/RequireRole";
import { BackButton } from "@/components/shared";
import { getLocalizedTitle } from "@/types/listing";

export default function ListingVerification() {
  const { listingId } = useParams<{ listingId: string }>();
  const { t, language } = useLanguage();

  const listingIdNum = listingId ? parseInt(listingId, 10) : 0;
  const { data: listing, isLoading: isListingLoading } =
    useListing(listingIdNum);

  if (isListingLoading) {
    return <PageLoader />;
  }

  if (!listingIdNum || !listing) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>{t("verification.listingNotFound")}</AlertTitle>
            <AlertDescription>
              {t("verification.listingNotFoundDesc")}
            </AlertDescription>
          </Alert>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <RequireAuth>
        <RequireLandlord>
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <BackButton label={t("verification.back")} />

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {t("verification.title")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {t("verification.subtitle")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-card border mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                  <Home className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{getLocalizedTitle(listing, language)}</p>
                  <p className="text-sm text-muted-foreground">{listing.city}</p>
                </div>
              </div>

              <VerificationUpload
                listingId={listingIdNum}
                listingTitle={getLocalizedTitle(listing, language)}
              />
            </div>
          </div>
        </RequireLandlord>
      </RequireAuth>
    </PageLayout>
  );
}
