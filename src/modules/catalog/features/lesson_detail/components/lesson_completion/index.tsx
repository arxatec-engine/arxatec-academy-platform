import { Button, Tooltip, TooltipContent, TooltipTrigger } from "arxatec-ui";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import {
  useCompleteLesson,
  useUncompleteLesson,
} from "@/modules/progress/hooks";
import { useCompletedCourse } from "@/modules/progress/hooks/use_completed_course";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { useUserStore } from "@/store/user";

interface Props {
  lessonId: string;
  courseSlug: string;
}

export const LessonCompletion = ({ lessonId, courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  const user = useUserStore((state) => state.user);
  const complete = useCompleteLesson();
  const uncomplete = useUncompleteLesson();
  const completedCourse = useCompletedCourse(courseSlug);
  const [override, setOverride] = useState<{
    lessonId: string;
    marked: boolean;
  } | null>(null);
  const isMarked =
    override?.lessonId === lessonId
      ? override.marked
      : Boolean(completedCourse);
  const completionLabel = t(
    isMarked ? PROGRESS_TEXT.unmark : PROGRESS_TEXT.markComplete,
  );
  const CompletionIcon = isMarked ? CheckCircle2 : Circle;
  if (!user) return null;
  const mark = () => {
    void toast.promise(
      complete
        .mutateAsync(lessonId)
        .then(() => setOverride({ lessonId, marked: true })),
      {
        loading: t(PROGRESS_TEXT.markComplete),
        success: t(PROGRESS_TEXT.marked),
        error: t(PROGRESS_TEXT.markFailed),
      },
    );
  };
  const unmark = () => {
    void toast.promise(
      uncomplete
        .mutateAsync(lessonId)
        .then(() => setOverride({ lessonId, marked: false })),
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
    </div>
  );
};
