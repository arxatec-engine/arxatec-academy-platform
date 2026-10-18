import { Button } from "arxatec-ui";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AccountMenu } from "@/components/shared/account_menu";
import { BrandLink } from "@/components/shared/brand_link";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

interface Props {
  adminMode?: boolean;
}

export const SiteHeader = ({ adminMode = false }: Props) => {
  const { t } = useTranslation(NS.common);
  const user = useUserStore((state) => state.user);
  const isAdminMode = adminMode && user?.role === "ADMIN";
  return (
    <header className="sticky top-0 z-30  backdrop-blur-md">
      <div className="mx-auto grid h-10 w-full max-w-3xl grid-cols-[1fr_auto] items-center gap-2 border-x border-b border-border bg-background px-4 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center">
          <BrandLink
            to={isAdminMode ? RouteHelpers.adminCourses() : RouteHelpers.home()}
          />
        </div>
        <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-3">
          {user ? (
            <AccountMenu user={user} adminMode={isAdminMode} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={RouteHelpers.login()}>{t(UI_TEXT.signIn)}</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to={RouteHelpers.register()}>
                  {t(UI_TEXT.createAccount)}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
