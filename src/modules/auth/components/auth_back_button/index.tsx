import { Button } from "arxatec-ui";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { AUTH_TEXT } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

export const AuthBackButton = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <Button asChild variant="outline" size="icon" className="size-7 self-start">
      <Link to={RouteHelpers.login()} aria-label={t(AUTH_TEXT.backToOptions)}>
        <ArrowLeft aria-hidden="true" className="size-4" />
      </Link>
    </Button>
  );
};
