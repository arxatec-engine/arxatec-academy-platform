import { Button, Logo } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";
import { NotFoundContent } from "./components/not_found_content";
import { errorScreen, type ErrorScreenKind } from "./i18n";

export interface ErrorScreenProps {
  kind?: ErrorScreenKind;
}

export const ErrorScreen = ({ kind = "unexpected" }: ErrorScreenProps) => {
  const { t } = useTranslation(NS.common);
  const copy = errorScreen.copy[kind];

  if (kind === "not_found") {
    return (
      <section className="flex min-h-80 w-full items-center justify-center bg-background px-5 py-16">
        <NotFoundContent />
      </section>
    );
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
        <Logo variant="academy" className="h-auto w-40 text-foreground" />
        <h1 className="text-xl font-medium text-foreground">{t(copy.title)}</h1>
        <p className="text-sm text-muted-foreground">{t(copy.description)}</p>
        <Button asChild size="lg" className="w-full">
          <Link to={RouteHelpers.home()}>{t(copy.action)}</Link>
        </Button>
      </div>
    </main>
  );
};
