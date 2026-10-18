import { Button } from "arxatec-ui";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { AdminPage } from "@/modules/admin/components/admin_page";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { RouteHelpers } from "@/routes/routes";
import { CourseList } from "../course_list";

export const CoursesOverview = () => {
  const { t } = useTranslation(NS.common);
  return (
    <AdminPage
      title={t(ADMIN_TEXT.courses)}
      action={
        <Button size="sm" className="shrink-0" asChild>
          <Link to={RouteHelpers.adminCourseCreate()}>
            <Plus aria-hidden="true" className="size-4" />
            {t(ADMIN_TEXT.create)}
          </Link>
        </Button>
      }
    >
      <CourseList />
    </AdminPage>
  );
};
