import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { CATALOG_TEXT } from "@/modules/catalog/i18n";
import { InterestPanel } from "@/modules/notifications/features/interest/components/interest_panel";
import { CatalogContent } from "../components/catalog_content";

const CourseCatalogPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(CATALOG_TEXT.title));
  return (
    <PageShell>
      <CatalogContent />
      <InterestPanel />
    </PageShell>
  );
};

export default CourseCatalogPage;
