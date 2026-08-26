import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { RouteHelpers } from "@/routes/routes";

export type ResetLinkInvalidReason = "expired" | "missing_token";

interface ResetLinkInvalidCopy {
  title: "reset_password.expired.title" | "reset_password.missing_token.title";
  description:
    | "reset_password.expired.description"
    | "reset_password.missing_token.description";
  action: "reset_password.expired.action" | "reset_password.missing_token.action";
}

const COPY: Record<ResetLinkInvalidReason, ResetLinkInvalidCopy> = {
  expired: {
    title: "reset_password.expired.title",
    description: "reset_password.expired.description",
    action: "reset_password.expired.action",
  },
  missing_token: {
    title: "reset_password.missing_token.title",
    description: "reset_password.missing_token.description",
    action: "reset_password.missing_token.action",
  },
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
      footer={<AuthFooterLink label={t("shared.back_to_login")} to={RouteHelpers.login()} />}
    >
      <div role="status" className="flex flex-col gap-3">
        <Button asChild size="sm" className="w-full">
          <Link to={RouteHelpers.forgotPassword()}>{t(copy.action)}</Link>
        </Button>
      </div>
    </AuthCard>
  );
};
