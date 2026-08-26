import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { RouteHelpers } from "@/routes/routes";

export const ResetPasswordSuccess = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t("reset_password.success.title")}
      subtitle={t("reset_password.success.description")}
    >
      <div role="status" className="flex flex-col gap-3">
        <Button asChild size="sm" className="w-full">
          <Link to={RouteHelpers.login()}>{t("reset_password.success.action")}</Link>
        </Button>
      </div>
    </AuthCard>
  );
};
