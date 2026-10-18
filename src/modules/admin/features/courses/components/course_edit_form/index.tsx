import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "arxatec-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import {
  useCreateAdminCourse,
  useUpdateAdminCourse,
} from "@/modules/admin/hooks";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type {
  AdminCourse,
  AdminCourseView,
  UpdateAdminCourse,
} from "@/modules/admin/types";
import { CourseTeacherFields } from "../course_teacher_fields";
import { COURSE_LEVELS, COURSE_TOPICS } from "@/modules/catalog/constants";
import {
  COURSE_LEVEL_LABELS,
  COURSE_TOPIC_LABELS,
} from "@/modules/catalog/i18n";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";
import { CourseStepActions } from "../course_step_actions";

interface Props {
  course?: AdminCourse;
  section?: "details" | "teacher";
  onContinue?: (view: AdminCourseView) => void;
  onBack?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const CourseEditForm = ({
  course,
  section,
  onContinue,
  onBack,
  onDirtyChange,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const create = useCreateAdminCourse();
  const update = useUpdateAdminCourse(course?.id ?? "");
  const isPending = create.isPending || update.isPending;
  const [savedCourse, setSavedCourse] = useState(course);
  const [form, setForm] = useState<UpdateAdminCourse>({
    teacher: course?.teacher ?? null,
    expected_updated_at: course?.updated_at ?? "",
    title: course?.title ?? "",
    short_description: course?.short_description ?? "",
    long_description: course?.long_description ?? "",
    topic: course?.topic ?? "FIRST_STEPS",
    level: course?.level ?? "INTRODUCTORY",
  });
  const change = (values: Partial<UpdateAdminCourse>) => {
    setForm((current) => ({ ...current, ...values }));
    onDirtyChange?.(true);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending || (!course && savedCourse)) return;
    // Another step (including the cover upload) may have updated this course.
    const current =
      !savedCourse ||
      (course &&
        Date.parse(course.updated_at) >= Date.parse(savedCourse.updated_at))
        ? course
        : savedCourse;
    const details = section === "teacher" && current ? current : form;
    const teacher = section === "details" ? current?.teacher : form.teacher;
    const input = {
      title: details.title.trim(),
      short_description: details.short_description,
      long_description: details.long_description,
      topic: details.topic,
      level: details.level,
    };
    const save = current
      ? update.mutateAsync({
          ...input,
          expected_updated_at: current.updated_at,
          teacher: teacher
            ? {
                ...teacher,
                full_name: teacher.full_name.trim(),
                biography: teacher.biography.trim(),
                photo_url: teacher.photo_url?.trim() || null,
              }
            : null,
        })
      : create.mutateAsync(input);
    void toast.promise(
      save.then((view) => {
        setSavedCourse(view.course);
        setForm((current) => ({
          ...current,
          expected_updated_at: view.course.updated_at,
          teacher:
            section === "details"
              ? current.teacher
              : (view.course.teacher ?? null),
        }));
        onDirtyChange?.(false);
        onContinue?.(view);
      }),
      {
        loading: t(course ? ADMIN_TEXT.save : ADMIN_TEXT.create),
        success: t(course ? ADMIN_TEXT.saved : ADMIN_TEXT.created),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <form className="space-y-4" onSubmit={submit}>
      <fieldset disabled={isPending} className="min-w-0 space-y-4">
        {section !== "teacher" && (
          <>
            <div>
              <Label htmlFor="admin-course-title">
                {t(ADMIN_TEXT.courseTitle)}
              </Label>
              <Input
                size="sm"
                id="admin-course-title"
                placeholder={t(ADMIN_TEXT.courseTitle)}
                className="mt-1.5"
                value={form.title}
                required
                maxLength={140}
                onChange={(event) => change({ title: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="admin-course-short">
                {t(ADMIN_TEXT.shortDescription)}
              </Label>
              <Textarea
                id="admin-course-short"
                placeholder={t(ADMIN_TEXT.shortDescription)}
                className="mt-1.5 text-sm"
                value={form.short_description}
                maxLength={140}
                onChange={(event) =>
                  change({ short_description: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="admin-course-long">
                {t(ADMIN_TEXT.longDescription)}
              </Label>
              <Textarea
                id="admin-course-long"
                placeholder={t(ADMIN_TEXT.longDescription)}
                rows={6}
                className="mt-1.5 text-sm"
                value={form.long_description}
                onChange={(event) =>
                  change({ long_description: event.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin-course-topic">
                  {t(ADMIN_TEXT.topic)}
                </Label>
                <Select
                  value={form.topic}
                  onValueChange={(value) => {
                    const next = COURSE_TOPICS.find((item) => item === value);
                    if (next) change({ topic: next });
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    id="admin-course-topic"
                    className="mt-1.5 w-full min-w-0"
                  >
                    <SelectValue placeholder={t(ADMIN_TEXT.topic)} />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_TOPICS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(COURSE_TOPIC_LABELS[item])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-course-level">
                  {t(ADMIN_TEXT.level)}
                </Label>
                <Select
                  value={form.level}
                  onValueChange={(value) => {
                    const next = COURSE_LEVELS.find((item) => item === value);
                    if (next) change({ level: next });
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    id="admin-course-level"
                    className="mt-1.5 w-full min-w-0"
                  >
                    <SelectValue placeholder={t(ADMIN_TEXT.level)} />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(COURSE_LEVEL_LABELS[item])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
        {section !== "details" && (
          <CourseTeacherFields
            value={form.teacher ?? null}
            onChange={(teacher) => change({ teacher })}
            disabled={isPending}
          />
        )}
      </fieldset>
      {onContinue ? (
        <CourseStepActions
          onBack={onBack}
          label={t(COURSE_SETUP_TEXT.saveContinue)}
          disabled={isPending || !form.title.trim()}
        />
      ) : (
        <Button
          size="sm"
          type="submit"
          disabled={isPending || !form.title.trim()}
        >
          {t(course ? ADMIN_TEXT.save : ADMIN_TEXT.create)}
        </Button>
      )}
    </form>
  );
};
