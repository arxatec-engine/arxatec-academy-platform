import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/layout/page_shell";
import { PageHeading } from "@/components/shared/page_heading";
import { useTitle } from "@/hooks";
import { NS } from "@/locales/namespaces";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { ExamContent } from "../components/exam_content";

const ExamPage = () => {
  const { t } = useTranslation(NS.common);
  useTitle(t(EXAM_TEXT.title));
  return (
    <PageShell>
      <PageHeading title={t(EXAM_TEXT.title)} />
      <ExamContent />
    </PageShell>
  );
};
export default ExamPage;
