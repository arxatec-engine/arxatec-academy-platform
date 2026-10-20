import {
  Button,
  Card,
  CardContent,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  StatusMessage,
} from "arxatec-ui";
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
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
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const submit = useSubmitCourseExam(exam.course.slug);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    exam.questions.map(() => null),
  );
  useEffect(() => {
    if (started) questionHeading.current?.focus();
  }, [started, currentQuestion]);
  const answered = answers.filter((value) => value !== null).length;
  const question = exam.questions[currentQuestion];
  const isLastQuestion = currentQuestion === exam.questions.length - 1;
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
          setCurrentQuestion(0);
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
  if (!question) return null;
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = answers.filter((value): value is number => value !== null);
    if (
      exam.version === null ||
      !isLastQuestion ||
      selected.length !== exam.question_count ||
      submit.isPending ||
      reloadRequired
    )
      return;
    submit.mutate({ version: exam.version, answers: selected });
  };
  return (
    <form
      onSubmit={send}
      aria-label={t(EXAM_TEXT.title)}
      className="flex flex-1 flex-col gap-6"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p>
            {t(EXAM_TEXT.questionPosition, {
              number: currentQuestion + 1,
              total: exam.question_count,
            })}
          </p>
          <p className="text-muted-foreground" aria-live="polite">
            {t(EXAM_TEXT.answered, { answered, total: exam.question_count })}
          </p>
        </div>
        <Progress
          value={(answered / exam.question_count) * 100}
          aria-label={t(EXAM_TEXT.answered, {
            answered,
            total: exam.question_count,
          })}
          className="h-1.5"
        />
      </div>
      <fieldset
        key={currentQuestion}
        disabled={submit.isPending || reloadRequired}
        className="min-w-0 flex-1 space-y-6 py-4 sm:py-8"
      >
        <legend className="sr-only">
          {t(EXAM_TEXT.questionPosition, {
            number: currentQuestion + 1,
            total: exam.question_count,
          })}
        </legend>
        <h2
          ref={questionHeading}
          id={`${id}-question-${currentQuestion}`}
          tabIndex={-1}
          className="text-xl leading-snug break-words tracking-tight outline-none sm:text-2xl"
        >
          {question.text}
        </h2>
        <RadioGroup
          aria-labelledby={`${id}-question-${currentQuestion}`}
          disabled={submit.isPending || reloadRequired}
          value={
            answers[currentQuestion] === null
              ? ""
              : String(answers[currentQuestion])
          }
          onValueChange={(value) =>
            setAnswers((current) =>
              current.map((answer, position) =>
                position === currentQuestion ? Number(value) : answer,
              ),
            )
          }
          className="gap-3"
        >
          {question.options.map((option, optionIndex) => (
            <Button
              key={optionIndex}
              size="sm"
              asChild
              variant="outline"
              className={cn(
                "h-auto min-h-12 w-full justify-start gap-3 px-4 py-3 text-left whitespace-normal",
                answers[currentQuestion] === optionIndex &&
                  "border-foreground bg-muted",
              )}
            >
              <Label htmlFor={`${id}-${currentQuestion}-${optionIndex}`}>
                <RadioGroupItem
                  id={`${id}-${currentQuestion}-${optionIndex}`}
                  value={String(optionIndex)}
                  className="shrink-0"
                />
                <span className="min-w-0 break-words">{option}</span>
              </Label>
            </Button>
          ))}
        </RadioGroup>
      </fieldset>
      {submit.isError && (
        <div role="alert" className="space-y-2 text-sm">
          <StatusMessage
            size="sm"
            color="rose"
            icon={TriangleAlert}
            title={t(EXAM_TEXT.title)}
            description={t(errorKey)}
          />
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
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button
          size="sm"
          type="button"
          variant="outline"
          disabled={currentQuestion === 0 || submit.isPending || reloadRequired}
          onClick={() => setCurrentQuestion((current) => current - 1)}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t(EXAM_TEXT.previous)}
        </Button>
        {isLastQuestion ? (
          <Button
            key="submit"
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
        ) : (
          <Button
            key="next"
            size="sm"
            type="button"
            disabled={
              answers[currentQuestion] === null ||
              submit.isPending ||
              reloadRequired
            }
            onClick={() => setCurrentQuestion((current) => current + 1)}
          >
            {t(EXAM_TEXT.next)}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
};
