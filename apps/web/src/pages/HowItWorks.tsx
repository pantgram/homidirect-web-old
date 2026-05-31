import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileCheck, MessageSquare, Key, Upload, UserCheck, Calendar, HandshakeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const tenantSteps = [
    { icon: Search, title: t("howItWorks.tenant.step1.title"), description: t("howItWorks.tenant.step1.desc") },
    { icon: FileCheck, title: t("howItWorks.tenant.step2.title"), description: t("howItWorks.tenant.step2.desc") },
    { icon: MessageSquare, title: t("howItWorks.tenant.step3.title"), description: t("howItWorks.tenant.step3.desc") },
    { icon: HandshakeIcon, title: t("howItWorks.tenant.step4.title"), description: t("howItWorks.tenant.step4.desc") },
  ];

  const ownerSteps = [
    { icon: Upload, title: t("howItWorks.owner.step1.title"), description: t("howItWorks.owner.step1.desc") },
    { icon: UserCheck, title: t("howItWorks.owner.step2.title"), description: t("howItWorks.owner.step2.desc") },
    { icon: Calendar, title: t("howItWorks.owner.step3.title"), description: t("howItWorks.owner.step3.desc") },
    { icon: Key, title: t("howItWorks.owner.step4.title"), description: t("howItWorks.owner.step4.desc") },
  ];

  return (
    <PageLayout>
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("howItWorks.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("howItWorks.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("howItWorks.forTenants")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("howItWorks.forTenantsDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tenantSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary mb-2">{t("howItWorks.step")} {index + 1}</div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="accent">
              <Link to="/search">{t("howItWorks.startSearchingProperties")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("howItWorks.forOwners")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("howItWorks.forOwnersDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ownerSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden border-border/50 hover:border-accent/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-accent mb-2">{t("howItWorks.step")} {index + 1}</div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="hero">
              <Link to="/list-property-info">{t("listInfo.startListing")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            {t("howItWorks.whyChoose")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <p className="text-muted-foreground">{t("howItWorks.commissionFees")}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">100%</div>
              <p className="text-muted-foreground">{t("howItWorks.directCommunication")}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{t("howItWorks.quickConnections")}</div>
              <p className="text-muted-foreground">{t("howItWorks.quickConnections")}</p>
            </div>
          </div>
          <Button asChild size="lg" variant="hero">
            <Link to="/">{t("howItWorks.goToHomepage")}</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
