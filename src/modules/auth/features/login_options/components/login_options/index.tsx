import { Button } from "arxatec-ui";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { Header } from "@/modules/auth/components/header";
import { RouteHelpers } from "@/routes/routes";
import { LOGIN_OPTIONS_TEXT } from "../../i18n";
import { PolicyConsent } from "./components/policy_consent";
import { ProviderOptions } from "./components/provider_options";

export const LoginOptions = () => {
  const { t } = useTranslation(NS.auth);
  const navigate = useNavigate();
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <Header
        title={t(LOGIN_OPTIONS_TEXT.title)}
        description={t(LOGIN_OPTIONS_TEXT.subtitle)}
      />
      <div className="flex flex-col gap-2 w-full h-full">
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={!hasAcceptedPolicies}
          onClick={() => {
            void navigate(RouteHelpers.loginEmail());
          }}
        >
          <Mail aria-hidden="true" className="size-4" />
          {t(LOGIN_OPTIONS_TEXT.email)}
        </Button>
        <ProviderOptions disabled={!hasAcceptedPolicies} />
      </div>
      <PolicyConsent
        checked={hasAcceptedPolicies}
        onCheckedChange={setHasAcceptedPolicies}
      />
    </div>
  );
};
