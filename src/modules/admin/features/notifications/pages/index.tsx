import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { AdminPage } from "@/modules/admin/components/admin_page";
import { NS } from "@/locales/namespaces";
import { NOTICES_TEXT } from "@/modules/admin/i18n";
import { NotificationsContent } from "../components/notifications_content";

const AdminNotificationsPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(NOTICES_TEXT.title));
  return (
    <AdminPage
      title={t(NOTICES_TEXT.title)}
      description={t(NOTICES_TEXT.subtitle)}
    >
      <NotificationsContent />
    </AdminPage>
  );
};

export default AdminNotificationsPage;
