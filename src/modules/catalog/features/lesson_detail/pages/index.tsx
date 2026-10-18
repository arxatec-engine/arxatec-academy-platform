import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { PAGE_TITLE_TEXT } from "@/constants/page_title";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { LessonContent } from "../components/lesson_content";

const LessonDetailPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(PAGE_TITLE_TEXT.lesson));
  return (
    <PageShell>
      <LessonContent />
    </PageShell>
  );
};

export default LessonDetailPage;
