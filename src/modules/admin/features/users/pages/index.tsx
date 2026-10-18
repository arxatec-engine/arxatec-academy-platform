import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { DIRECTORY_TEXT } from "@/modules/admin/i18n";
import { DirectoryContent } from "../components/directory_content";

const DirectoryPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(DIRECTORY_TEXT.title));
  return <DirectoryContent />;
};

export default DirectoryPage;
