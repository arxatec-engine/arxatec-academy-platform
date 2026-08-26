import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { RouteHelpers } from "@/routes/routes";

export const OauthCallbackLoading = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t("oauth_callback.loading.title")}
      subtitle={t("oauth_callback.loading.description")}
      footer={<AuthFooterLink label={t("shared.back_to_login")} to={RouteHelpers.login()} />}
    >
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex items-center justify-center py-1"
      >
        <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
        <span className="sr-only">{t("shared.loading")}</span>
      </div>
    </AuthCard>
  );
};
