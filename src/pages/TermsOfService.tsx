import { PageLayout } from "@/components/layout/PageLayout";
import { BackButton } from "@/components/shared/BackButton";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
  const { t } = useLanguage();

  const sections = [
    { title: t("terms.section1.title"), content: t("terms.section1.content"), items: null },
    { title: t("terms.section2.title"), content: t("terms.section2.content"), items: null },
    { title: t("terms.section3.title"), content: t("terms.section3.content"), items: [t("terms.section3.item1"), t("terms.section3.item2"), t("terms.section3.item3"), t("terms.section3.item4")] },
    { title: t("terms.section4.title"), content: t("terms.section4.content"), items: null },
    { title: t("terms.section5.title"), content: t("terms.section5.content"), items: null },
    { title: t("terms.section6.title"), content: t("terms.section6.content"), items: null },
    { title: t("terms.section7.title"), content: t("terms.section7.content"), items: null },
  ];

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <BackButton to="/" label={t("terms.backToHome")} />

        <h1 className="text-4xl font-bold text-foreground mb-4">{t("terms.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("terms.lastUpdated")}</p>

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

export default TermsOfService;
