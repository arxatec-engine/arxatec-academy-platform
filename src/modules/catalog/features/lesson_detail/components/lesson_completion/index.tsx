import { Button, Tooltip, TooltipContent, TooltipTrigger } from "arxatec-ui";
import { Award, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { CERTIFICATE_TEXT } from "@/modules/progress/features/certificate/i18n";
import {
  useCompleteLesson,
  useUncompleteLesson,
} from "@/modules/progress/hooks";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

interface Props {
  lessonId: string;
}

export const LessonCompletion = ({ lessonId }: Props) => {
  const { t } = useTranslation(NS.common);
  const user = useUserStore((state) => state.user);
  const complete = useCompleteLesson();
  const uncomplete = useUncompleteLesson();
  const [markedId, setMarkedId] = useState<string | null>(null);
  const isMarked = markedId === lessonId;
  const completionLabel = t(
    isMarked ? PROGRESS_TEXT.unmark : PROGRESS_TEXT.markComplete,
  );
  const CompletionIcon = isMarked ? CheckCircle2 : Circle;
  const certificateId =
    complete.data?.lesson_id === lessonId
      ? complete.data.enrollment?.certificate_id
      : null;
  const enrollment =
    complete.data?.lesson_id === lessonId ? complete.data.enrollment : null;
  const examReady =
    enrollment &&
    enrollment.lesson_count > 0 &&
    enrollment.completed_lessons >= enrollment.lesson_count &&
    isMarked;
  if (!user) return null;
  const mark = () => {
    void toast.promise(
      complete.mutateAsync(lessonId).then(() => setMarkedId(lessonId)),
      {
        loading: t(PROGRESS_TEXT.markComplete),
        success: t(PROGRESS_TEXT.marked),
        error: t(PROGRESS_TEXT.markFailed),
      },
    );
  };
  const unmark = () => {
    void toast.promise(
      uncomplete.mutateAsync(lessonId).then(() => setMarkedId(null)),
      {
        loading: t(PROGRESS_TEXT.unmark),
        success: t(PROGRESS_TEXT.unmarked),
        error: t(PROGRESS_TEXT.unmarkFailed),
      },
    );
  };
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            type="button"
            variant="secondary"
            className="size-7 p-0 text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
            aria-label={completionLabel}
            aria-pressed={isMarked}
            disabled={complete.isPending || uncomplete.isPending}
            onClick={isMarked ? unmark : mark}
          >
            <CompletionIcon aria-hidden="true" className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          {completionLabel}
        </TooltipContent>
      </Tooltip>
      {examReady && !certificateId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" asChild variant="ghost" className="size-8 p-0">
              <Link
                to={RouteHelpers.exam(enrollment.course.slug)}
                aria-label={t(EXAM_TEXT.take)}
              >
                <ClipboardList aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {t(EXAM_TEXT.take)}
          </TooltipContent>
        </Tooltip>
      )}
      {isMarked && certificateId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" asChild variant="ghost" className="size-8 p-0">
              <Link
                to={RouteHelpers.certificate(certificateId)}
                aria-label={t(CERTIFICATE_TEXT.view)}
              >
                <Award aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {t(CERTIFICATE_TEXT.view)}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
