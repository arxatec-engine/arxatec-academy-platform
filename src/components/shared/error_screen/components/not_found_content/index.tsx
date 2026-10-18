import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { RouteHelpers } from "@/routes/routes";
import { errorScreen } from "../../i18n";
import styles from "./not_found_content.module.css";

export const NotFoundContent = () => {
  const { t } = useTranslation(NS.common);
  const copy = errorScreen.copy.not_found;
  useTitle(t(copy.title));

  return (
    <div className={styles.content}>
      <p className="text-[13px] leading-5 text-muted-foreground">404</p>
      <h1 className="mt-3 text-2xl leading-[1.2] font-normal tracking-[-0.02em] text-balance text-foreground ">
        {t(copy.title)}
      </h1>
      <p className="mx-auto max-w-md text-base mt-2 leading-[1.5] text-pretty text-muted-foreground">
        {t(copy.description)}
      </p>
      <Button asChild size="sm" className="mt-4 font-normal">
        <Link to={RouteHelpers.home()}>{t(copy.action)}</Link>
      </Button>
    </div>
  );
};
