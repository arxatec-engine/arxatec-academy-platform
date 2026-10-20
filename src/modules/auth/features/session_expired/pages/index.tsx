import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { sessionExpired } from "@/modules/auth/features/session_expired/i18n";
import { SessionExpiredActions } from "../components/session_expired_actions";
import { useReturnPath } from "../hooks/use_return_path";
import { useSessionClose } from "../hooks/use_session_close";

const SessionExpiredPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(sessionExpired.title));
  const { close, pendingTarget } = useSessionClose();

  useReturnPath();

  return (
    <AuthCard
      status="info"
      icon={LogIn}
      title={t(sessionExpired.title)}
      subtitle={t(sessionExpired.description)}
    >
      <SessionExpiredActions
        primaryLabel={t(sessionExpired.primaryAction)}
        secondaryLabel={t(sessionExpired.secondaryAction)}
        pendingTarget={pendingTarget}
        onSelect={close}
      />
    </AuthCard>
  );
};

export default SessionExpiredPage;
