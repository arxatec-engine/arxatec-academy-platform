import { Button } from "arxatec-ui";
import { ArrowRight, ClipboardList, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type { CourseExam } from "@/modules/progress/types/exams";

export const ExamIntro = ({
  exam,
  onStart,
}: {
  exam: CourseExam;
  onStart: () => void;
}) => {
  const { t } = useTranslation(NS.common);

  return (
    <section
      aria-labelledby="exam-intro-title"
      className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center sm:py-12"
    >
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 translate-x-2 -translate-y-2 rotate-3 rounded-xl border border-border bg-muted/30"
        />
        <div className="flex size-44 flex-col justify-between rounded-xl border border-border bg-background p-5 text-left sm:size-48">
          <div aria-hidden="true" className="flex items-center justify-between text-muted-foreground">
            <ClipboardList className="size-5" />
            <span className="flex gap-1">
              <span className="size-1 rounded-full bg-current" />
              <span className="size-1 rounded-full bg-current opacity-50" />
              <span className="size-1 rounded-full bg-current opacity-25" />
            </span>
          </div>
          <div>
            <p className="text-6xl leading-none font-medium tracking-tight tabular-nums sm:text-7xl">
              {exam.question_count}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(EXAM_TEXT.questions)}
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-md space-y-2">
        <h2 id="exam-intro-title" className="text-xl font-medium tracking-tight">
          {t(EXAM_TEXT.introTitle)}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(EXAM_TEXT.intro, {
            total: exam.question_count,
            required: exam.passing_score,
            percent: Math.round((exam.passing_score / exam.question_count) * 100),
          })}
        </p>
      </div>
      <Button size="sm" type="button" onClick={onStart} className="gap-2">
        {t(EXAM_TEXT.begin)}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
      {exam.last_result?.score != null && (
        <p className="flex max-w-full items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
          <History aria-hidden="true" className="size-3.5 shrink-0" />
          <span>
            {t(EXAM_TEXT.lastScore, {
              score: exam.last_result.score,
              total: exam.last_result.question_count,
            })}
          </span>
        </p>
      )}
    </section>
  );
};
