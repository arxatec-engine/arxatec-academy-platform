import { Button } from "arxatec-ui";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthNote } from "@/modules/auth/components/auth_note";
import { forgotPassword } from "@/modules/auth/features/forgot_password/i18n";
import { shared } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

export interface ForgotPasswordSentProps {
  onResend: () => void;
}

export const ForgotPasswordSent = ({ onResend }: ForgotPasswordSentProps) => {
  const { t } = useTranslation(NS.auth);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    container.current?.focus();
  }, []);

  return (
    <div
      ref={container}
      tabIndex={-1}
      className="flex w-full max-w-sm justify-center outline-none"
    >
      <AuthCard
        title={t(forgotPassword.sent.title)}
        subtitle={t(forgotPassword.sent.description)}
      >
        <AuthNote text={t(forgotPassword.sent.hint)} />
        <Button asChild size="sm" className="w-full">
          <Link to={RouteHelpers.login()}>{t(shared.backToLogin)}</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onResend}
        >
          {t(forgotPassword.sent.resend)}
        </Button>
      </AuthCard>
    </div>
  );
};
