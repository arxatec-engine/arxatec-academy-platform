import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { PageHeading } from "@/components/shared/page_heading";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { MyCoursesContent } from "../components/my_courses_content";

const MyCoursesPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(PROGRESS_TEXT.myCourses));
  return (
    <PageShell>
      <PageHeading title={t(PROGRESS_TEXT.myCourses)} />
      <MyCoursesContent />
    </PageShell>
  );
};

export default MyCoursesPage;
