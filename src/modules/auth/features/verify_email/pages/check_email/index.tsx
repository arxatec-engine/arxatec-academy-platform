import { Button } from "arxatec-ui";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useTitle } from "@/hooks";
import { useAuth } from "@/hooks/use_auth";
import { NS } from "@/locales/namespaces";
import { AuthNote } from "@/modules/auth/components/auth_note";
import { checkEmail } from "@/modules/auth/features/verify_email/i18n";
import {
  AUTH_RESEND_COOLDOWN_SECONDS,
  CHECK_EMAIL_STATE_KEY,
} from "@/modules/auth/constants";
import { RouteHelpers } from "@/routes/routes";
import { ResendVerificationButton } from "../../components/resend_verification_button";
import { VerificationStateCard } from "../../components/verification_state_card";

const CheckEmailPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(checkEmail.title));
  const { user, isPending } = useAuth();
  const { state } = useLocation();
  const email = user === null ? null : user.email;
  const deliveryState =
    typeof state === "object" &&
    state !== null &&
    CHECK_EMAIL_STATE_KEY in state
      ? Boolean((state as Record<string, unknown>)[CHECK_EMAIL_STATE_KEY])
      : null;
  const justSent = deliveryState === true;
  const sendFailed = deliveryState === false;

  return (
    <VerificationStateCard
      icon={Mail}
      busy={isPending}
      status={sendFailed ? "error" : "info"}
      title={t(checkEmail.title)}
      description={
        email === null
          ? undefined
          : t(sendFailed ? checkEmail.deliveryFailed : checkEmail.description, {
              email,
            })
      }
      secondary={t(checkEmail.secondary)}
      footer={<AuthNote text={t(checkEmail.footer)} />}
    >
      <Button asChild size="sm" className="w-full">
        <Link to={RouteHelpers.home()}>{t(checkEmail.primaryAction)}</Link>
      </Button>
      <ResendVerificationButton
        initialCooldownSeconds={
          justSent ? AUTH_RESEND_COOLDOWN_SECONDS : undefined
        }
      />
    </VerificationStateCard>
  );
};

export default CheckEmailPage;
