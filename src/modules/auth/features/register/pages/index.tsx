import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { AuthBackButton } from "@/modules/auth/components/auth_back_button";
import { Header } from "@/modules/auth/components/header";
import { register } from "@/modules/auth/features/register/i18n";
import { RegisterForm } from "../components/register_form";

const RegisterPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(register.pageTitle));

  return (
    <>
      <AuthBackButton />
      <Header
        title={t(register.title)}
        description={t(register.subtitle)}
      />
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
