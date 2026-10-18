import { useTranslation } from "react-i18next";
import { UI_TEXT } from "@/components/shared/i18n";
import { LanguageSelector } from "@/components/shared/language_selector";
import { ThemeSelector } from "@/components/shared/theme_selector";
import { NS } from "@/locales/namespaces";

export const PersonalizationSettings = () => {
  const { t } = useTranslation(NS.common);

  return (
    <div className="space-y-3 text-sm grid md:grid-cols-2">
      <section className="flex flex-col items-start gap-x-2 gap-y-1">
        <h2 className="w-16 shrink-0 text-sm font-normal">
          {t(UI_TEXT.theme)}
        </h2>
        <ThemeSelector />
      </section>
      <section className="flex flex-col items-start gap-x-2 gap-y-1">
        <h2 className="w-16 shrink-0 text-sm font-normal">
          {t(UI_TEXT.language)}
        </h2>
        <LanguageSelector />
      </section>
    </div>
  );
};
