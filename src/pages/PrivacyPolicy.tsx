import { PageLayout } from "@/components/layout/PageLayout";
import { BackButton } from "@/components/shared/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  const sections = [
    { title: t("privacy.section1.title"), content: t("privacy.section1.content"), items: null },
    { title: t("privacy.section2.title"), content: t("privacy.section2.content"), items: [t("privacy.section2.item1"), t("privacy.section2.item2"), t("privacy.section2.item3"), t("privacy.section2.item4")] },
    { title: t("privacy.section3.title"), content: t("privacy.section3.content"), items: null },
    { title: t("privacy.section4.title"), content: t("privacy.section4.content"), items: null },
    { title: t("privacy.section5.title"), content: t("privacy.section5.content"), items: null },
    { title: t("privacy.section6.title"), content: t("privacy.section6.content"), items: null },
  ];

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <BackButton to="/" label={t("privacy.backToHome")} />

        <h1 className="text-4xl font-bold text-foreground mb-4">{t("privacy.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {sections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{section.title}</h2>
              <p className="text-muted-foreground mb-4">{section.content}</p>
              {section.items && (
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  {section.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </PageLayout>
  );
};

export default PrivacyPolicy;
