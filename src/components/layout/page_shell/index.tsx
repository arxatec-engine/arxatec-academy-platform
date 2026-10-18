import { Button } from "arxatec-ui";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { UI_TEXT } from "@/components/shared/i18n";
import { SiteFooter } from "@/components/shared/site_footer";
import { SiteHeader } from "@/components/shared/site_header";
import { NS } from "@/locales/namespaces";
import { cn } from "@/utilities/cn";

interface Props {
  children: ReactNode;
  className?: string;
  navigation?: ReactNode;
}

export const PageShell = ({ children, className, navigation }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col bg-card font-sans text-sm text-foreground">
      <Button
        size="sm"
        asChild
        className="sr-only fixed top-3 left-4 z-50 focus:not-sr-only"
      >
        <a href="#main-content">{t(UI_TEXT.skipToContent)}</a>
      </Button>
      <SiteHeader />
      {navigation}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          "mx-auto w-full bg-background max-w-3xl min-w-0 flex-1 px-4 py-4 outline-none sm:px-6 sm:py-6 border-l border-r border-border",
          className,
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};
