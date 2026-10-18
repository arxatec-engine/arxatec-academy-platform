import { useTranslation } from "react-i18next";
import { PAGE_TITLE_TEXT } from "@/constants/page_title";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { useAdminRoute } from "@/modules/admin/hooks/use_admin_route";
import { CourseDialog } from "../../components/course_dialog";
import { CoursesOverview } from "../../components/courses_overview";

const AdminCoursePage = () => {
  const { t } = useTranslation(NS.common);
  const { id } = useAdminRoute();
  useTitle(t(id ? PAGE_TITLE_TEXT.editCourse : ADMIN_TEXT.create));
  return (
    <>
      <CoursesOverview />
      <CourseDialog courseId={id} />
    </>
  );
};

export default AdminCoursePage;
