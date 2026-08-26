import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LanguageSelector } from "@/components/shared/language_selector";
import { ThemeSelector } from "@/components/shared/theme_selector";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";

const CourseCatalogPage = () => {
  const { t } = useTranslation(NS.common);

  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-2 px-4 py-4">
        <span className="text-sm font-medium text-foreground">{t("app.name")}</span>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-medium text-foreground">{t("catalog.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("catalog.subtitle")}</p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link to={RouteHelpers.login()}>{t("catalog.sign_in")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={RouteHelpers.register()}>{t("catalog.register")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseCatalogPage;
