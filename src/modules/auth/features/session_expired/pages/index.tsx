import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";

import { SessionExpiredActions } from "../components/session_expired_actions";
import { SessionExpiredError } from "../components/session_expired_error";
import { useReturnPath } from "../hooks/use_return_path";
import { useSessionClose } from "../hooks/use_session_close";

const SessionExpiredPage = () => {
  const { t } = useTranslation(NS.auth);
  const { close, retry, pendingTarget, error } = useSessionClose();

  useReturnPath();

  return (
    <AuthCard title={t("session_expired.title")} subtitle={t("session_expired.description")}>
      <SessionExpiredActions
        primaryLabel={t("session_expired.primary_action")}
        secondaryLabel={t("session_expired.secondary_action")}
        pendingTarget={pendingTarget}
        onSelect={close}
      />
      {error === null ? null : <SessionExpiredError error={error} onRetry={retry} />}
    </AuthCard>
  );
};

export default SessionExpiredPage;
