import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { MODERATION_TEXT } from "@/modules/admin/i18n";
import { ModerationContent } from "../components/moderation_content";

const ModerationPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(MODERATION_TEXT.title));
  return <ModerationContent />;
};

export default ModerationPage;
