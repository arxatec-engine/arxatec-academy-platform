import { Button } from "arxatec-ui";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/use_auth";
import { NS } from "@/locales/namespaces";
import { AuthNote } from "@/modules/auth/components/auth_note";
import {
  AUTH_RESEND_COOLDOWN_SECONDS,
  CHECK_EMAIL_STATE_KEY,
} from "@/modules/auth/constants";
import { RouteHelpers } from "@/routes/routes";

import { HighlightedEmail } from "../../components/highlighted_email";
import { ResendVerificationButton } from "../../components/resend_verification_button";
import { VerificationStateCard } from "../../components/verification_state_card";

const CheckEmailPage = () => {
  const { t } = useTranslation(NS.auth);
  const { user, isPending } = useAuth();
  const { state } = useLocation();
  const email = user === null ? null : user.email;
  const justSent =
    typeof state === "object" && state !== null && CHECK_EMAIL_STATE_KEY in state
      ? Boolean((state as Record<string, unknown>)[CHECK_EMAIL_STATE_KEY])
      : false;

  return (
    <VerificationStateCard
      icon={Mail}
      busy={isPending}
      title={t("check_email.title")}
      description={
        email === null ? undefined : (
          <HighlightedEmail text={t("check_email.description", { email })} email={email} />
        )
      }
      secondary={t("check_email.secondary")}
      footer={<AuthNote text={t("check_email.footer")} />}
    >
      <Button asChild size="sm" className="w-full">
        <Link to={RouteHelpers.home()}>{t("check_email.primary_action")}</Link>
      </Button>
      <ResendVerificationButton
        initialCooldownSeconds={justSent ? AUTH_RESEND_COOLDOWN_SECONDS : undefined}
      />
    </VerificationStateCard>
  );
};

export default CheckEmailPage;
