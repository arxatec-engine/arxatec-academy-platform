import { Button } from "arxatec-ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";
import type { LessonView } from "@/modules/catalog/types";
import { CERTIFICATE_TEXT } from "@/modules/progress/features/certificate/i18n";
import { useCompletedCourse } from "@/modules/progress/hooks/use_completed_course";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  view: LessonView;
  courseSlug: string;
}

export const LessonNavigation = ({ view, courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  const completedCourse = useCompletedCourse(courseSlug);
  const certificateId = completedCourse?.certificateId;
  const nextAction = view.navigation.next
    ? {
        to: RouteHelpers.lesson(courseSlug, view.navigation.next.slug),
        label: t(LESSON_TEXT.next),
        description: view.navigation.next.title,
      }
    : completedCourse
      ? {
          to: certificateId
            ? RouteHelpers.certificate(certificateId)
            : RouteHelpers.exam(courseSlug),
          label: t(certificateId ? CERTIFICATE_TEXT.view : EXAM_TEXT.take),
          description: t(
            certificateId
              ? EXAM_TEXT.certificateAvailable
              : EXAM_TEXT.takeForCertificate,
          ),
        }
      : null;
  if (!view.navigation.previous && !nextAction) return null;
  return (
    <nav
      aria-label={t(LESSON_TEXT.navigation)}
      className="mt-6 grid gap-3 sm:grid-cols-2"
    >
      {view.navigation.previous && (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-auto min-w-0 justify-start gap-3 p-2 text-left whitespace-normal"
        >
          <Link to={RouteHelpers.lesson(courseSlug, view.navigation.previous.slug)}>
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0">
              <span className=" block text-sm font-normal">
                {t(LESSON_TEXT.previous)}
              </span>
              <span className="text-sm text-muted-foreground">{view.navigation.previous.title}</span>
            </span>
          </Link>
        </Button>
      )}
      {nextAction && (
        <Button
          asChild
          size="sm"
          className="h-auto min-w-0 justify-between gap-3 p-2 text-left whitespace-normal sm:col-start-2"
        >
          <Link to={nextAction.to}>
            <span className="min-w-0">
              <span className="block text-sm font-normal">
                {nextAction.label}
              </span>
              <span className="text-sm text-muted-foreground">{nextAction.description}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </Button>
      )}
    </nav>
  );
};
