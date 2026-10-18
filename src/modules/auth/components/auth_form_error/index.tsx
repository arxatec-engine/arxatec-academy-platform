import { StatusMessage } from "arxatec-ui";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { AUTH_ERROR_TEXT } from "./i18n";

export interface AuthFormErrorProps {
  message: string;
  action?: ReactNode;
}

export const AuthFormError = ({ message, action }: AuthFormErrorProps) => {
  const { t } = useTranslation(NS.auth);

  return (
    <div role="alert" className="space-y-2">
      <StatusMessage
        title={t(AUTH_ERROR_TEXT.title)}
        description={message}
        color="rose"
        size="sm"
        icon={TriangleAlert}
      />
      {action}
    </div>
  );
};
