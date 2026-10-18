import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { AuthBackButton } from "@/modules/auth/components/auth_back_button";
import { Header } from "@/modules/auth/components/header";
import { login } from "@/modules/auth/features/login/i18n";
import { startGoogleAuthorize } from "@/modules/auth/utils/google_authorize";
import { LoginForm } from "../components/login_form";

const LoginPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(login.pageTitle));

  return (
    <>
      <AuthBackButton />
      <Header title={t(login.title)} description={t(login.subtitle)} />
      <LoginForm onGoogleLogin={startGoogleAuthorize} />
    </>
  );
};

export default LoginPage;
