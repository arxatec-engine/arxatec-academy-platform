import { useTranslation } from "react-i18next";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { CoursesOverview } from "../../components/courses_overview";

const AdminCoursesPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(ADMIN_TEXT.courses));
  return <CoursesOverview />;
};

export default AdminCoursesPage;
