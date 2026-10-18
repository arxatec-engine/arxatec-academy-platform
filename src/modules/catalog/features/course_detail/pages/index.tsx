import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { PAGE_TITLE_TEXT } from "@/constants/page_title";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { CourseContent } from "../components/course_content";

const CourseDetailPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(PAGE_TITLE_TEXT.course));
  return (
    <PageShell>
      <CourseContent />
    </PageShell>
  );
};

export default CourseDetailPage;
