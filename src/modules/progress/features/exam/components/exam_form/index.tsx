import {
  Button,
  Card,
  CardContent,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
} from "arxatec-ui";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type { CourseExam } from "@/modules/progress/types/exams";
import { cn } from "@/utilities/cn";
import { useSubmitCourseExam } from "../../hooks";
import { ExamResult } from "../exam_result";

export const ExamForm = ({
  exam,
  onReload,
}: {
  exam: CourseExam;
  onReload: () => void;
}) => {
  const { t } = useTranslation(NS.common);
  const id = useId();
  const submit = useSubmitCourseExam(exam.course.slug);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    exam.questions.map(() => null),
  );
  const answered = answers.filter((value) => value !== null).length;
  const errorKey =
    submit.error instanceof ApiError
      ? submit.error.code === "EXAM_CHANGED"
        ? EXAM_TEXT.changed
        : submit.error.code === "EXAM_LOCKED"
          ? EXAM_TEXT.locked
          : submit.error.code === "EXAM_UNAVAILABLE"
            ? EXAM_TEXT.unavailable
            : submit.error.code === "RATE_LIMITED"
              ? EXAM_TEXT.rateLimited
              : EXAM_TEXT.submitFailed
      : EXAM_TEXT.submitFailed;
  const reloadRequired =
    submit.error instanceof ApiError &&
    ["EXAM_CHANGED", "EXAM_LOCKED", "EXAM_UNAVAILABLE"].includes(
      submit.error.code ?? "",
    );
  if (submit.data)
    return (
      <ExamResult
        result={submit.data}
        onRetry={() => {
          submit.reset();
          setAnswers(exam.questions.map(() => null));
          setStarted(false);
        }}
      />
    );
  const intro = t(EXAM_TEXT.intro, {
    total: exam.question_count,
    required: exam.passing_score,
    percent: Math.round((exam.passing_score / exam.question_count) * 100),
  });
  if (!started)
    return (
      <Card className="py-4 shadow-none">
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{intro}</p>
          {exam.last_result?.score != null && (
            <p className="text-sm">
              {t(EXAM_TEXT.lastScore, {
                score: exam.last_result.score,
                total: exam.question_count,
              })}
            </p>
          )}
          <Button size="sm" type="button" onClick={() => setStarted(true)}>
            {t(EXAM_TEXT.begin)}
          </Button>
        </CardContent>
      </Card>
    );
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = answers.filter((value): value is number => value !== null);
    if (
      exam.version === null ||
      selected.length !== exam.question_count ||
      submit.isPending ||
      reloadRequired
    )
      return;
    submit.mutate({ version: exam.version, answers: selected });
  };
  return (
    <form onSubmit={send} className="space-y-3">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{intro}</p>
        <p className="text-sm" aria-live="polite">
          {t(EXAM_TEXT.answered, { answered, total: exam.question_count })}
        </p>
        <Progress
          value={(answered / exam.question_count) * 100}
          aria-label={t(EXAM_TEXT.answered, {
            answered,
            total: exam.question_count,
          })}
          className="h-1.5"
        />
      </div>
      {exam.questions.map((question, index) => (
        <fieldset
          key={index}
          disabled={submit.isPending || reloadRequired}
          className="min-w-0 space-y-3 rounded-md border border-border bg-card p-4"
        >
          <legend className="sr-only">
            {t(EXAM_TEXT.question, { number: index + 1 })}
          </legend>
          <p className="text-sm text-muted-foreground">
            {t(EXAM_TEXT.question, { number: index + 1 })}
          </p>
          <p id={`${id}-question-${index}`} className="break-words text-base">
            {question.text}
          </p>
          <RadioGroup
            aria-labelledby={`${id}-question-${index}`}
            disabled={submit.isPending || reloadRequired}
            value={answers[index] === null ? "" : String(answers[index])}
            onValueChange={(value) =>
              setAnswers((current) =>
                current.map((answer, position) =>
                  position === index ? Number(value) : answer,
                ),
              )
            }
          >
            {question.options.map((option, optionIndex) => (
              <Button
                key={optionIndex}
                size="sm"
                asChild
                variant="outline"
                className={cn(
                  "h-auto min-h-8 w-full justify-start gap-2 py-2 text-left whitespace-normal",
                  answers[index] === optionIndex &&
                    "border-foreground bg-muted",
                )}
              >
                <Label htmlFor={`${id}-${index}-${optionIndex}`}>
                  <RadioGroupItem
                    id={`${id}-${index}-${optionIndex}`}
                    value={String(optionIndex)}
                    className="shrink-0"
                  />
                  <span className="min-w-0 break-words">{option}</span>
                </Label>
              </Button>
            ))}
          </RadioGroup>
        </fieldset>
      ))}
      {submit.isError && (
        <div role="alert" className="space-y-2 text-sm">
          <p className="text-destructive">{t(errorKey)}</p>
          {reloadRequired && (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onReload}
            >
              {t(EXAM_TEXT.reload)}
            </Button>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <Button
          size="sm"
          type="submit"
          disabled={
            answered !== exam.question_count ||
            submit.isPending ||
            reloadRequired
          }
        >
          {t(submit.isPending ? EXAM_TEXT.submitting : EXAM_TEXT.submit)}
        </Button>
      </div>
    </form>
  );
};
