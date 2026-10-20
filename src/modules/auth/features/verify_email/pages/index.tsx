import { Button } from "arxatec-ui";
import {
  CircleAlert,
  CircleCheck,
  Link2Off,
  MailCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useTitle } from "@/hooks";
import { errorScreen } from "@/components/shared/error_screen/i18n";
import { NS } from "@/locales/namespaces";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { verifyEmail } from "@/modules/auth/features/verify_email/i18n";
import { shared } from "@/modules/auth/i18n";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { rememberReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";
import { selectIsAuthenticated, useUserStore } from "@/store/user";
import { VerificationStateCard } from "../components/verification_state_card";
import { useVerifyEmail } from "../hooks/use_verify_email";

interface VerifyEmailView {
  icon: LucideIcon;
  title: string;
  description: string;
  busy?: boolean;
  action?: ReactNode;
  footer?: ReactNode;
}

const VerifyEmailPage = () => {
  const { t } = useTranslation(NS.auth);
  const { t: tCommon } = useTranslation(NS.common);
  const { status, error } = useVerifyEmail();
  const hasSession = useUserStore(selectIsAuthenticated);

  const catalogFooter = (
    <AuthFooterLink
      label={t(shared.goToCatalog)}
      to={RouteHelpers.home()}
    />
  );

  const linkAction = (to: string, label: string): ReactNode => (
    <Button asChild size="sm" className="w-full">
      <Link to={to}>{label}</Link>
    </Button>
  );

  const rememberCheckEmail = (): void => {
    rememberReturnPath(RouteHelpers.checkEmail());
  };

  const signInAction = (label: string): ReactNode => (
    <Button asChild size="sm" className="w-full">
      <Link to={RouteHelpers.login()} onClick={rememberCheckEmail}>
        {label}
      </Link>
    </Button>
  );

  const resolveView = (): VerifyEmailView => {
    if (status === "loading") {
      return {
        icon: MailCheck,
        busy: true,
        title: t(verifyEmail.loading.title),
        description: t(verifyEmail.loading.description),
      };
    }

    if (status === "success") {
      return {
        icon: CircleCheck,
        title: t(verifyEmail.success.title),
        description: t(verifyEmail.success.description),
        action: linkAction(
          RouteHelpers.home(),
          t(verifyEmail.success.action),
        ),
      };
    }

    if (status === "already") {
      return {
        icon: MailCheck,
        title: t(verifyEmail.already.title),
        description: t(verifyEmail.already.description),
        action: linkAction(
          RouteHelpers.home(),
          t(verifyEmail.already.action),
        ),
      };
    }

    if (status === "expired") {
      return {
        icon: Link2Off,
        title: t(verifyEmail.expired.title),
        description: hasSession
          ? t(verifyEmail.expired.description)
          : t(verifyEmail.expired.signedOut.description),
        action: hasSession
          ? linkAction(
              RouteHelpers.checkEmail(),
              t(verifyEmail.expired.action),
            )
          : signInAction(t(verifyEmail.expired.signedOut.action)),
        footer: catalogFooter,
      };
    }

    if (status === "missing_token") {
      return {
        icon: Link2Off,
        title: t(verifyEmail.missingToken.title),
        description: hasSession
          ? t(verifyEmail.missingToken.description)
          : t(verifyEmail.missingToken.signedOut.description),
        action: hasSession
          ? linkAction(
              RouteHelpers.checkEmail(),
              t(verifyEmail.missingToken.action),
            )
          : signInAction(t(verifyEmail.missingToken.signedOut.action)),
        footer: catalogFooter,
      };
    }

    return {
      icon: CircleAlert,
      title: tCommon(errorScreen.copy.unexpected.title),
      description: authErrorMessage(error, t),
      footer: catalogFooter,
    };
  };

  const view = resolveView();
  useTitle(view.title);

  return (
    <VerificationStateCard
      announce
      icon={view.icon}
      status={
        status === "success" || status === "already" || status === "loading"
          ? "info"
          : "error"
      }
      busy={view.busy}
      title={view.title}
      description={view.description}
      footer={view.footer}
    >
      {view.action}
    </VerificationStateCard>
  );
};

export default VerifyEmailPage;
