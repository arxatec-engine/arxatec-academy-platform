import { Skeleton } from "arxatec-ui";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { oauthCallback } from "@/modules/auth/features/oauth_callback/i18n";
import { shared } from "@/modules/auth/i18n";
import { RouteHelpers } from "@/routes/routes";

export const OauthCallbackLoading = () => {
  const { t } = useTranslation(NS.auth);

  return (
    <AuthCard
      title={t(oauthCallback.loading.title)}
      subtitle={t(oauthCallback.loading.description)}
      footer={
        <AuthFooterLink
          label={t(shared.backToLogin)}
          to={RouteHelpers.login()}
        />
      }
    >
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="py-1"
      >
        <Skeleton
          aria-hidden="true"
          className="h-24 w-full motion-reduce:animate-none"
        />
        <span className="sr-only">{t(shared.loading)}</span>
      </div>
    </AuthCard>
  );
};
