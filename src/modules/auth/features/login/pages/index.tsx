import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthDivider } from "@/modules/auth/components/auth_divider";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { GoogleButton } from "@/modules/auth/components/google_button";
import { startGoogleAuthorize } from "@/modules/auth/utils/google_authorize";
import { RouteHelpers } from "@/routes/routes";

import { LoginForm } from "../components/login_form";

const LoginPage = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <AuthFooterLink
          question={t("login.footer.question")}
          label={t("login.footer.link")}
          to={RouteHelpers.register()}
        />
      }
    >
      <GoogleButton label={t("shared.google_button")} onClick={startGoogleAuthorize} />
      <AuthDivider label={t("shared.divider")} />
      <LoginForm onGoogleLogin={startGoogleAuthorize} />
    </AuthCard>
  );
};

export default LoginPage;
