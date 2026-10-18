import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { LoginOptions } from "../components/login_options";
import { LOGIN_OPTIONS_TEXT } from "../i18n";

const LoginOptionsPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(LOGIN_OPTIONS_TEXT.pageTitle));

  return <LoginOptions />;
};

export default LoginOptionsPage;
