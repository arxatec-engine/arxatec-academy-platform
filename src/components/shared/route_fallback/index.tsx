import { LoaderSplash } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";

export const RouteFallback = () => {
  const { t } = useTranslation(NS.common);

  return (
    <div
      role="status"
      aria-label={t(UI_TEXT.loading.default)}
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 grid min-h-svh w-full place-items-center bg-background text-foreground"
    >
      <div aria-hidden="true" className="[&>div]:h-auto [&>div]:w-auto">
        <LoaderSplash size={2} />
      </div>
    </div>
  );
};
