import { Button, Checkbox, Input, Label, StatusMessage } from "arxatec-ui";
import { TriangleAlert } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { useSaveAdminCourseExam } from "@/modules/admin/hooks/exams";
import { EXAM_RULES } from "@/modules/progress/constants/exams";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type {
  AdminCourseExam,
  SaveCourseExam,
} from "@/modules/progress/types/exams";
import { adminExamSchema } from "../../schemas/exam";
import { CourseExamQuestion } from "../course_exam_question";

interface Props {
  courseId: string;
  exam: AdminCourseExam | null;
  locked: boolean;
  onReload: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}
const initialForm = (exam: AdminCourseExam | null): SaveCourseExam => ({
  expected_version: exam?.version ?? 0,
  enabled: exam?.enabled ?? false,
  passing_score: exam?.passing_score ?? EXAM_RULES.passingScore,
  questions:
    exam?.questions ??
    Array.from({ length: EXAM_RULES.questionCount }, () => ({
      text: "",
      options: Array.from({ length: EXAM_RULES.optionCount }, () => ""),
      correct_option: -1,
    })),
});
export const CourseExamForm = ({
  courseId,
  exam,
  locked,
  onReload,
  onDirtyChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const id = useId();
  const save = useSaveAdminCourseExam(courseId);
  const [form, setForm] = useState(() => initialForm(exam));
  const [openQuestion, setOpenQuestion] = useState("0");
  const [invalidQuestion, setInvalidQuestion] = useState<
    number | null | undefined
  >(undefined);
  const changed =
    save.error instanceof ApiError && save.error.code === "EXAM_CHANGED";
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm(exam));
  const disabled = save.isPending || locked;
  const change = (next: SaveCourseExam) => {
    setForm(next);
    onDirtyChange?.(JSON.stringify(next) !== JSON.stringify(initialForm(exam)));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = adminExamSchema.safeParse(form);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const index =
        issue?.path[0] === "questions" && typeof issue.path[1] === "number"
          ? issue.path[1]
          : null;
      setInvalidQuestion(index);
      if (index !== null) {
        setOpenQuestion(String(index));
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLTextAreaElement>(
              `[data-exam-question="${index}"] textarea`,
            )
            ?.focus(),
        );
      }
      return;
    }
    setInvalidQuestion(undefined);
    save.mutate(parsed.data, {
      onSuccess: () => {
        onDirtyChange?.(false);
        toast.success(t(EXAM_TEXT.saved));
      },
    });
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <fieldset disabled={disabled} className="min-w-0 space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-enabled`}
            checked={form.enabled}
            disabled={disabled}
            onCheckedChange={(enabled) =>
              change({ ...form, enabled: enabled === true })
            }
          />
          <Label htmlFor={`${id}-enabled`}>{t(EXAM_TEXT.enabled)}</Label>
        </div>
        <div className="max-w-xs space-y-1">
          <Label htmlFor={`${id}-passing`}>{t(EXAM_TEXT.passingScore)}</Label>
          <Input
            id={`${id}-passing`}
            size="sm"
            type="number"
            min={1}
            max={EXAM_RULES.questionCount}
            step={1}
            placeholder={String(EXAM_RULES.passingScore)}
            value={form.passing_score}
            onChange={(event) =>
              change({ ...form, passing_score: Number(event.target.value) })
            }
          />
        </div>
        {invalidQuestion !== undefined && (
          <div role="alert">
            <StatusMessage
              size="sm"
              color="rose"
              icon={TriangleAlert}
              title={t(EXAM_TEXT.adminTitle)}
              description={t(
                invalidQuestion === null
                  ? EXAM_TEXT.invalid
                  : EXAM_TEXT.invalidQuestion,
                { number: (invalidQuestion ?? 0) + 1 },
              )}
            />
          </div>
        )}
        <div className="space-y-2">
          {form.questions.map((question, index) => (
            <CourseExamQuestion
              key={index}
              question={question}
              index={index}
              disabled={disabled}
              open={openQuestion === String(index)}
              onOpenChange={(open) =>
                setOpenQuestion(open ? String(index) : "")
              }
              onChange={(next) =>
                change({
                  ...form,
                  questions: form.questions.map((current, position) =>
                    position === index ? next : current,
                  ),
                })
              }
            />
          ))}
        </div>
        <Button size="sm" type="submit" disabled={disabled || !dirty}>
          {t(EXAM_TEXT.save)}
        </Button>
      </fieldset>
      {save.isError && (
        <div role="alert" className="space-y-2 text-sm">
          <StatusMessage
            size="sm"
            color="rose"
            icon={TriangleAlert}
            title={t(EXAM_TEXT.adminTitle)}
            description={t(changed ? EXAM_TEXT.changed : EXAM_TEXT.saveFailed)}
          />
          {changed && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onReload}
            >
              {t(EXAM_TEXT.reload)}
            </Button>
          )}
        </div>
      )}
    </form>
  );
};
