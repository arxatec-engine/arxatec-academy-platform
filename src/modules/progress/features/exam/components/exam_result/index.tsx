import { Button, StatusMessage } from "arxatec-ui";
import { CircleAlert, CircleCheck } from "lucide-react";
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
  const { t } = useTranslation(NS.common);
  return (
    <div className="space-y-3" role="status">
      <StatusMessage
        size="sm"
        color={result.passed ? "white" : "rose"}
        icon={result.passed ? CircleCheck : CircleAlert}
        title={t(
          result.passed
            ? result.score === null
              ? EXAM_TEXT.certificateAvailable
              : EXAM_TEXT.passed
            : EXAM_TEXT.failed,
        )}
        description={
          result.score === null
            ? t(CERTIFICATE_TEXT.verified)
            : t(EXAM_TEXT.score, {
                score: result.score,
                total: result.question_count,
              })
        }
      />
      {!result.passed && (
        <p className="text-sm text-muted-foreground">
          {t(EXAM_TEXT.intro, {
            total: result.question_count,
            required: result.passing_score,
            percent: Math.round(
              (result.passing_score / result.question_count) * 100,
            ),
          })}
        </p>
      )}
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
