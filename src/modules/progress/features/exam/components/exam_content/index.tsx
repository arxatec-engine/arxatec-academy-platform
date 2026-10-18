import { Button } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { EXAM_RULES } from "@/modules/progress/constants/exams";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import { ROUTE_PARAM_NAMES, RouteHelpers } from "@/routes/routes";
import { useCourseExam } from "../../hooks";
import { ExamForm } from "../exam_form";
import { ExamResult } from "../exam_result";

export const ExamContent = () => {
  const { t } = useTranslation(NS.common);
  const params = useParams();
  const slug = params[ROUTE_PARAM_NAMES.slug] ?? "";
  const query = useCourseExam(slug);
  if (query.isPending) return <LoadingScreen />;
  if (query.isError)
    return (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t(EXAM_TEXT.loadFailed)}
        </p>
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={() => void query.refetch()}
        >
          {t(EXAM_TEXT.reload)}
        </Button>
      </div>
    );
  const exam = query.data;
  return (
    <div className="space-y-4">
      <p className="text-base">{exam.course.title}</p>
      {exam.status === "passed" ? (
        <ExamResult
          result={{
            score: exam.last_result?.score ?? null,
            passed: true,
            passing_score:
              exam.last_result?.passing_score ?? exam.passing_score,
            question_count: exam.question_count,
            certificate_id: exam.certificate_id,
          }}
        />
      ) : exam.status === "ready" &&
        exam.version !== null &&
        exam.questions.length === EXAM_RULES.questionCount ? (
        <ExamForm
          key={`${slug}:${exam.version}`}
          exam={exam}
          onReload={() => void query.refetch()}
        />
      ) : (
        <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
          {t(
            exam.status === "locked" ? EXAM_TEXT.locked : EXAM_TEXT.unavailable,
          )}
        </p>
      )}
      <Button size="sm" asChild variant="outline">
        <Link to={RouteHelpers.course(slug)}>{t(EXAM_TEXT.back)}</Link>
      </Button>
    </div>
  );
};
