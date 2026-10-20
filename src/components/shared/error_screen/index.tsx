import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageShell } from "@/components/layout/page_shell";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";
import { errorScreen, type ErrorScreenKind } from "./i18n";
import styles from "./error_screen.module.css";

export interface ErrorScreenProps {
  kind?: ErrorScreenKind;
}

export const ErrorScreen = ({ kind = "unexpected" }: ErrorScreenProps) => {
  const { t } = useTranslation(NS.common);
  const copy = errorScreen.copy[kind];
  const notFound = kind === "not_found";
  useTitle(t(copy.title));

  return (
    <PageShell className="flex items-center justify-center px-5 py-16 sm:py-20">
      <div className={styles.content}>
        <p className="text-[13px] leading-5 text-muted-foreground">
          {notFound ? "404" : t(errorScreen.label)}
        </p>
        <div
          role={notFound ? "status" : "alert"}
          className="mt-3"
        >
          <h1 className="text-2xl leading-[1.2] font-normal tracking-[-0.02em] text-balance text-foreground">
            {t(copy.title)}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-base leading-[1.5] text-pretty text-muted-foreground">
            {t(copy.description)}
          </p>
        </div>
        <Button asChild size="sm" className="mt-4 font-normal">
          <Link to={RouteHelpers.home()}>{t(copy.action)}</Link>
        </Button>
      </div>
    </PageShell>
  );
};
