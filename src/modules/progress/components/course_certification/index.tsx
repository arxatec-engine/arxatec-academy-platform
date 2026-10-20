import { Button, StatusMessage } from "arxatec-ui";
import { Award, ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { CERTIFICATE_TEXT } from "@/modules/progress/features/certificate/i18n";
import { useCompletedCourse } from "@/modules/progress/hooks/use_completed_course";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { RouteHelpers } from "@/routes/routes";

export const CourseCertification = ({ courseSlug }: { courseSlug: string }) => {
  const { t } = useTranslation(NS.common);
  const course = useCompletedCourse(courseSlug);
  if (!course) return null;

  const certificateId = course.certificateId;
  return (
    <section
      className="my-6 max-w-3xl space-y-3"
      aria-label={t(EXAM_TEXT.lessonsCompleted)}
    >
      <div role="status">
        <StatusMessage
          size="sm"
          color="white"
          icon={certificateId ? Award : ClipboardCheck}
          title={t(
            certificateId
              ? EXAM_TEXT.certificateAvailable
              : EXAM_TEXT.lessonsCompleted,
          )}
          description={t(
            certificateId
              ? EXAM_TEXT.certificateReadyHint
              : EXAM_TEXT.certificateHint,
          )}
        />
      </div>
      <Button size="sm" asChild className="h-auto whitespace-normal text-left">
        <Link
          to={
            certificateId
              ? RouteHelpers.certificate(certificateId)
              : RouteHelpers.exam(courseSlug)
          }
        >
          {t(
            certificateId
              ? CERTIFICATE_TEXT.view
              : EXAM_TEXT.takeForCertificate,
          )}
        </Link>
      </Button>
    </section>
  );
};
