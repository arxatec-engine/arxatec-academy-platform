import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { RouteHelpers } from "@/routes/routes";

import { RegisterForm } from "../components/register_form";

const RegisterPage = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <AuthFooterLink
          question={t("register.footer.question")}
          label={t("register.footer.link")}
          to={RouteHelpers.login()}
        />
      }
    >
      <RegisterForm />
    </AuthCard>
  );
};

export default RegisterPage;
