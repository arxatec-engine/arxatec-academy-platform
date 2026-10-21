import { Button, Card } from "arxatec-ui";
import { ArrowRight, Award, ClipboardCheck } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { EXAM_RULES } from "@/modules/progress/constants/exams";
import { CERTIFICATE_TEXT } from "@/modules/progress/features/certificate/i18n";
import { useCompletedCourse } from "@/modules/progress/hooks/use_completed_course";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { RouteHelpers } from "@/routes/routes";

export const CourseCertification = ({ courseSlug }: { courseSlug: string }) => {
  const { t } = useTranslation(NS.common);
  const titleId = useId();
  const course = useCompletedCourse(courseSlug);
  if (!course) return null;

  const certificateId = course.certificateId;
  const actionLabel = t(certificateId ? CERTIFICATE_TEXT.view : EXAM_TEXT.take);
  return (
    <section className="mt-6" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-2 text-lg">
        {t(EXAM_TEXT.sectionTitle)}
      </h2>
      <Card className="gap-0 overflow-hidden rounded-md py-0 shadow-none">
        <Button
          asChild
          variant="ghost"
          className="group h-auto w-full justify-start gap-3 rounded-md p-3 text-left whitespace-normal sm:p-4"
        >
          <Link
            aria-label={actionLabel}
            to={
              certificateId
                ? RouteHelpers.certificate(certificateId)
                : RouteHelpers.exam(courseSlug)
            }
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground group-hover:text-foreground">
              {certificateId ? (
                <Award aria-hidden="true" className="size-5" />
              ) : (
                <ClipboardCheck aria-hidden="true" className="size-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm">
                {t(certificateId ? EXAM_TEXT.certificateAvailable : EXAM_TEXT.title)}
              </span>
              <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                {t(
                  certificateId
                    ? EXAM_TEXT.certificateReadyHint
                    : EXAM_TEXT.cardDescription,
                  { count: EXAM_RULES.questionCount },
                )}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm font-normal">
              <span className="hidden sm:inline">{actionLabel}</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
        </Button>
      </Card>
    </section>
  );
};
