import { Button } from "arxatec-ui";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type { ExamResult as Result } from "@/modules/progress/types/exams";
import { RouteHelpers } from "@/routes/routes";
import { CERTIFICATE_TEXT } from "../../../certificate/i18n";

export const ExamResult = ({
  result,
  onRetry,
}: {
  result: Result;
  onRetry?: () => void;
}) => {
  const { t, i18n } = useTranslation(NS.common);
  const grade =
    result.score !== null && result.question_count > 0
      ? new Intl.NumberFormat(i18n.resolvedLanguage, {
          maximumFractionDigits: 1,
        }).format((result.score / result.question_count) * 10)
      : null;
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center sm:py-16"
      role="status"
    >
      <div
        className="flex size-44 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30 sm:size-48"
        aria-label={
          grade === null
            ? t(CERTIFICATE_TEXT.verified)
            : t(EXAM_TEXT.score, {
                score: result.score,
                total: result.question_count,
              })
        }
      >
        {grade === null ? (
          <CircleCheck aria-hidden="true" className="size-14" />
        ) : (
          <span
            aria-hidden="true"
            className="text-5xl font-medium tracking-tight tabular-nums sm:text-6xl"
          >
            {grade}<span className="text-2xl text-muted-foreground sm:text-3xl">/10</span>
          </span>
        )}
      </div>
      <h2 className="max-w-sm text-base font-medium">
        {t(
          result.passed
            ? result.score === null
              ? EXAM_TEXT.certificateAvailable
              : EXAM_TEXT.passed
            : EXAM_TEXT.retryHint,
        )}
      </h2>
      {result.certificate_id && (
        <Button size="sm" asChild>
          <Link to={RouteHelpers.certificate(result.certificate_id)}>
            {t(CERTIFICATE_TEXT.view)}
          </Link>
        </Button>
      )}
      {!result.passed && onRetry && (
        <Button size="sm" type="button" onClick={onRetry}>
          {t(EXAM_TEXT.retry)}
        </Button>
      )}
    </div>
  );
};
