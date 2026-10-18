import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { sessionExpired } from "@/modules/auth/features/session_expired/i18n";
import { SessionExpiredActions } from "../components/session_expired_actions";
import { SessionExpiredError } from "../components/session_expired_error";
import { useReturnPath } from "../hooks/use_return_path";
import { useSessionClose } from "../hooks/use_session_close";

const SessionExpiredPage = () => {
  const { t } = useTranslation(NS.auth);
  useTitle(t(sessionExpired.title));
  const { close, pendingTarget, error } = useSessionClose();

  useReturnPath();

  return (
    <AuthCard
      title={t(sessionExpired.title)}
      subtitle={t(sessionExpired.description)}
    >
      <SessionExpiredActions
        primaryLabel={t(sessionExpired.primaryAction)}
        secondaryLabel={t(sessionExpired.secondaryAction)}
        pendingTarget={pendingTarget}
        onSelect={close}
      />
      {error === null ? null : (
        <SessionExpiredError error={error} />
      )}
    </AuthCard>
  );
};

export default SessionExpiredPage;
