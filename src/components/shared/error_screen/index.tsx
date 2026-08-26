import { Button, Isotype } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";

type ErrorScreenKind = "not_found" | "unexpected";

interface ErrorScreenCopy {
  title: "errors.not_found.title" | "errors.unexpected.title";
  description: "errors.not_found.description" | "errors.unexpected.description";
  action: "errors.not_found.action" | "errors.unexpected.action";
}

const COPY: Record<ErrorScreenKind, ErrorScreenCopy> = {
  not_found: {
    title: "errors.not_found.title",
    description: "errors.not_found.description",
    action: "errors.not_found.action",
  },
  unexpected: {
    title: "errors.unexpected.title",
    description: "errors.unexpected.description",
    action: "errors.unexpected.action",
  },
};

export interface ErrorScreenProps {
  kind?: ErrorScreenKind;
  onRetry?: () => void;
}

export const ErrorScreen = ({ kind = "unexpected", onRetry }: ErrorScreenProps) => {
  const { t } = useTranslation(NS.common);
  const copy = COPY[kind];

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        <Isotype className="size-7 text-foreground" />
        <h1 className="text-xl font-medium text-foreground">{t(copy.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(copy.description)}</p>
        {onRetry === undefined ? (
          <Button asChild size="lg" className="w-full">
            <Link to={RouteHelpers.home()}>{t(copy.action)}</Link>
          </Button>
        ) : (
          <>
            <Button type="button" size="lg" className="w-full" onClick={onRetry}>
              {t("actions.retry")}
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full">
              <Link to={RouteHelpers.home()}>{t("actions.go_to_catalog")}</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
};
