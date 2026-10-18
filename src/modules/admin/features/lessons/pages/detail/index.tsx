import { useTranslation } from "react-i18next";
import { PAGE_TITLE_TEXT } from "@/constants/page_title";
import { useTitle } from "@/hooks";
import { AdminPage } from "@/modules/admin/components/admin_page";
import { NS } from "@/locales/namespaces";
import { LessonEditor } from "../../components/lesson_editor";

const AdminLessonPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(PAGE_TITLE_TEXT.editLesson));
  return (
    <AdminPage>
      <LessonEditor />
    </AdminPage>
  );
};

export default AdminLessonPage;
