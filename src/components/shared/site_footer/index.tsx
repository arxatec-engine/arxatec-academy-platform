import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLink } from "@/components/shared/brand_link";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";

const legalLinkClassName =
  "rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export const SiteFooter = () => {
  const { t } = useTranslation(NS.common);
  return (
    <footer>
      <div className="mx-auto flex bg-background w-full border-t border-l border-r border-border max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLink />
        <div className="space-y-2 sm:text-right">
          <nav
            aria-label={t(UI_TEXT.legal)}
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-normal text-muted-foreground sm:justify-end"
          >
            <Link to={RouteHelpers.terms()} className={legalLinkClassName}>
              {t(UI_TEXT.terms)}
            </Link>
            <Link to={RouteHelpers.privacy()} className={legalLinkClassName}>
              {t(UI_TEXT.privacy)}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
