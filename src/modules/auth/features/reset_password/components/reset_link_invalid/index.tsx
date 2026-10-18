import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { resetPassword } from "@/modules/auth/features/reset_password/i18n";
import { shared } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

export type ResetLinkInvalidReason = "expired" | "missing_token";

const COPY = {
  expired: resetPassword.expired,
  missing_token: resetPassword.missingToken,
};

export interface ResetLinkInvalidProps {
  reason: ResetLinkInvalidReason;
}

export const ResetLinkInvalid = ({ reason }: ResetLinkInvalidProps) => {
  const { t } = useTranslation(NS.auth);
  const copy = COPY[reason];

  return (
    <AuthCard
      title={t(copy.title)}
      subtitle={t(copy.description)}
      footer={
        <AuthFooterLink
          label={t(shared.backToLogin)}
          to={RouteHelpers.login()}
        />
      }
    >
      <div role="status" className="flex flex-col gap-2">
        <Button asChild size="sm" className="w-full">
          <Link to={RouteHelpers.forgotPassword()}>{t(copy.action)}</Link>
        </Button>
      </div>
    </AuthCard>
  );
};
