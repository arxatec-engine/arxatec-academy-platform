import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { resetPassword } from "@/modules/auth/features/reset_password/i18n";
import { RouteHelpers } from "@/routes/routes";

export const ResetPasswordSuccess = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t(resetPassword.success.title)}
      subtitle={t(resetPassword.success.description)}
    >
      <div role="status" className="flex flex-col gap-2">
        <Button asChild size="sm" className="w-full">
          <Link to={RouteHelpers.login()}>
            {t(resetPassword.success.action)}
          </Link>
        </Button>
      </div>
    </AuthCard>
  );
};
