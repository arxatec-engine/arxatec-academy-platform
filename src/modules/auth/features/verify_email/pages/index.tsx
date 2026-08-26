import { Button } from "arxatec-ui";
import {
  CircleAlert,
  CircleCheck,
  Link2Off,
  LoaderCircle,
  MailCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { rememberReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";
import { selectIsAuthenticated, useUserStore } from "@/store/user";

import { VerificationStateCard } from "../components/verification_state_card";
import { useVerifyEmail } from "../hooks/use_verify_email";

interface VerifyEmailView {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  busy?: boolean;
  action?: ReactNode;
  footer?: ReactNode;
}

const VerifyEmailPage = () => {
  const { t } = useTranslation(NS.auth);
  const { t: tCommon } = useTranslation(NS.common);
  const { status, error, retry } = useVerifyEmail();
  const hasSession = useUserStore(selectIsAuthenticated);

  const catalogFooter = (
    <AuthFooterLink label={t("shared.go_to_catalog")} to={RouteHelpers.home()} />
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
        icon: LoaderCircle,
        iconClassName: "animate-spin",
        busy: true,
        title: t("verify_email.loading.title"),
        description: t("verify_email.loading.description"),
      };
    }

    if (status === "success") {
      return {
        icon: CircleCheck,
        title: t("verify_email.success.title"),
        description: t("verify_email.success.description"),
        action: linkAction(RouteHelpers.home(), t("verify_email.success.action")),
      };
    }

    if (status === "already") {
      return {
        icon: MailCheck,
        title: t("verify_email.already.title"),
        description: t("verify_email.already.description"),
        action: linkAction(RouteHelpers.home(), t("verify_email.already.action")),
      };
    }

    if (status === "expired") {
      return {
        icon: Link2Off,
        title: t("verify_email.expired.title"),
        description: hasSession
          ? t("verify_email.expired.description")
          : t("verify_email.expired.signed_out.description"),
        action: hasSession
          ? linkAction(RouteHelpers.checkEmail(), t("verify_email.expired.action"))
          : signInAction(t("verify_email.expired.signed_out.action")),
        footer: catalogFooter,
      };
    }

    if (status === "missing_token") {
      return {
        icon: Link2Off,
        title: t("verify_email.missing_token.title"),
        description: hasSession
          ? t("verify_email.missing_token.description")
          : t("verify_email.missing_token.signed_out.description"),
        action: hasSession
          ? linkAction(RouteHelpers.checkEmail(), t("verify_email.missing_token.action"))
          : signInAction(t("verify_email.missing_token.signed_out.action")),
        footer: catalogFooter,
      };
    }

    return {
      icon: CircleAlert,
      title: tCommon("errors.unexpected.title"),
      description: authErrorMessage(error, t),
      action: (
        <Button type="button" size="sm" className="w-full" onClick={retry}>
          {tCommon("actions.retry")}
        </Button>
      ),
      footer: catalogFooter,
    };
  };

  const view = resolveView();

  return (
    <VerificationStateCard
      announce
      icon={view.icon}
      iconClassName={view.iconClassName}
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
