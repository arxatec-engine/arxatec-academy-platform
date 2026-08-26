import { Isotype } from "arxatec-ui";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";

interface LoadingScreenProps {
  labelKey?: "states.loading" | "states.loading_session";
}

export const LoadingScreen = ({ labelKey = "states.loading" }: LoadingScreenProps) => {
  const { t } = useTranslation(NS.common);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-svh w-full items-center justify-center bg-background text-foreground"
    >
      <Isotype className="size-10 animate-pulse text-muted-foreground" />
      <span className="sr-only">{t(labelKey)}</span>
    </div>
  );
};
