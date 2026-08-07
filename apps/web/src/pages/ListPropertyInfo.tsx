import { Home, EuroIcon, MapPin, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const ListPropertyInfo = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, isLandlord } = useAuth();

  const handleGetStarted = () => {
    if (!isAuthenticated || !isLandlord) {
      navigate("/auth");
    } else {
      navigate("/list-property");
    }
  };

  return (
    <PageLayout showFooter={false}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("listInfo.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("listInfo.subtitle")}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <Home className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t("listInfo.noFees")}</CardTitle>
              <CardDescription>{t("listInfo.noFeesDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <EuroIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t("listInfo.setPrice")}</CardTitle>
              <CardDescription>{t("listInfo.setPriceDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{t("listInfo.directContact")}</CardTitle>
              <CardDescription>
                {t("listInfo.directContactDesc")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Steps */}
        <Card className="max-w-3xl mx-auto mb-12">
          <CardHeader>
            <CardTitle>{t("listInfo.howToList")}</CardTitle>
            <CardDescription>{t("listInfo.howToListDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("listInfo.step1")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("listInfo.step1Desc")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("listInfo.step2")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("listInfo.step2Desc")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("listInfo.step3")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("listInfo.step3Desc")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("listInfo.step4")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("listInfo.step4Desc")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto">
          {!isAuthenticated && (
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t("listInfo.needRegister")}
              </p>
            </div>
          )}
          {isAuthenticated && !isLandlord && (
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t("listInfo.tenantAccount")}
              </p>
            </div>
          )}
          <Button size="lg" onClick={handleGetStarted} className="group">
            {!isAuthenticated || !isLandlord
              ? t("listInfo.registerButton")
              : t("listInfo.startListing")}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground text-sm">
            {t("common.footer")}
          </p>
        </div>
      </footer>
    </PageLayout>
  );
};

export default ListPropertyInfo;
