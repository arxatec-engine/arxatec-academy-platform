import { Logo } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";

export const BrandLink = () => {
  const { t } = useTranslation(NS.common);
  return (
    <Link
      to={RouteHelpers.home()}
      aria-label={t(UI_TEXT.brand)}
      className="flex shrink-0 items-center rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Logo variant="academy" className="h-auto w-36" />
    </Link>
  );
};
