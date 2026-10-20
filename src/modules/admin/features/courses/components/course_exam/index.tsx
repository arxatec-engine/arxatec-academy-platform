import { Button, StatusMessage } from "arxatec-ui";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { useAdminCourseExam } from "@/modules/admin/hooks/exams";
import type { AdminCourse } from "@/modules/admin/types";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { CourseExamForm } from "../course_exam_form";

interface Props {
  course: AdminCourse;
  embedded?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export const CourseExam = ({ course, embedded, onDirtyChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const query = useAdminCourseExam(course.id);
  return (
    <AdminSection
      title={t(EXAM_TEXT.adminTitle)}
      description={embedded ? undefined : t(EXAM_TEXT.adminHint)}
      showHeading={!embedded}
      className={embedded ? "border-0 pt-0" : undefined}
    >
      {query.isPending ? (
        <LoadingScreen />
      ) : query.isError ? (
        <div role="alert" className="space-y-2">
          <StatusMessage
            size="sm"
            color="rose"
            icon={TriangleAlert}
            title={t(EXAM_TEXT.adminTitle)}
            description={t(EXAM_TEXT.loadFailed)}
          />
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            {t(EXAM_TEXT.reload)}
          </Button>
        </div>
      ) : (
        <CourseExamForm
          key={`${course.id}:${query.data.exam?.version ?? 0}`}
          courseId={course.id}
          exam={query.data.exam}
          locked={course.status === "ARCHIVED"}
          onReload={() => {
            const version = query.data.exam?.version;
            void query.refetch().then((result) => {
              if (result.isSuccess && result.data.exam?.version !== version)
                onDirtyChange?.(false);
            });
          }}
          onDirtyChange={onDirtyChange}
        />
      )}
    </AdminSection>
  );
};
