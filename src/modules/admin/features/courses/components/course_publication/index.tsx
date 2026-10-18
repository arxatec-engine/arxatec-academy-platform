import { Button } from "arxatec-ui";
import { Check, Circle, CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import {
  COURSE_SETUP_STEP,
  type CourseSetupStep,
} from "@/modules/admin/constants/course_setup";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourseView } from "@/modules/admin/types";
import {
  COURSE_LEVEL_LABELS,
  COURSE_TOPIC_LABELS,
} from "@/modules/catalog/i18n";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";
import { CourseActions } from "../course_actions";

interface Props {
  view: AdminCourseView;
  unsavedSteps: { id: CourseSetupStep; title: string }[];
  onEdit: (step: CourseSetupStep) => void;
  onDiscard: () => void;
}

export const CoursePublication = ({
  view,
  unsavedSteps,
  onEdit,
  onDiscard,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const { course, lessons } = view;
  const publishedCount = lessons.filter(
    (lesson) => lesson.status === "PUBLISHED",
  ).length;
  const checklist = [
    {
      id: COURSE_SETUP_STEP.details,
      title: t(COURSE_SETUP_TEXT.details),
      complete: Boolean(course.title.trim()),
      optional: false,
    },
    {
      id: COURSE_SETUP_STEP.teacher,
      title: t(ADMIN_TEXT.teacher),
      complete: Boolean(course.teacher),
      optional: true,
    },
    {
      id: COURSE_SETUP_STEP.cover,
      title: t(ADMIN_TEXT.cover),
      complete: Boolean(course.cover_image_url),
      optional: true,
    },
    {
      id: COURSE_SETUP_STEP.lessons,
      title: t(COURSE_SETUP_TEXT.publishedLessons, {
        published: publishedCount,
        total: lessons.length,
      }),
      complete: publishedCount > 0,
      optional: false,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-sm font-normal text-muted-foreground">
          {t(COURSE_SETUP_TEXT.summary)}
        </h3>
        <p className="text-lg [overflow-wrap:anywhere]">{course.title}</p>
        {course.short_description && (
          <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {course.short_description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {t(COURSE_TOPIC_LABELS[course.topic])} ·{" "}
          {t(COURSE_LEVEL_LABELS[course.level])}
        </p>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border px-3">
        {checklist.map((item) => (
          <li key={item.id}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onEdit(item.id)}
              className="h-auto w-full justify-start gap-3 px-0 py-3 text-left font-normal whitespace-normal"
            >
              {item.complete ? (
                <Check aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              )}
              <span className="min-w-0 flex-1">{item.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {t(
                  item.complete
                    ? COURSE_SETUP_TEXT.complete
                    : item.optional
                      ? COURSE_SETUP_TEXT.optional
                      : COURSE_SETUP_TEXT.pending,
                )}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {unsavedSteps.length > 0 ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>{t(COURSE_SETUP_TEXT.unsavedHint)}</p>
          <div className="flex flex-wrap gap-2">
            {unsavedSteps.map((step) => (
              <Button
                key={step.id}
                size="sm"
                variant="outline"
                onClick={() => onEdit(step.id)}
              >
                {step.title}
              </Button>
            ))}
          </div>
          <Button size="sm" type="button" variant="ghost" onClick={onDiscard}>
            {t(COURSE_SETUP_TEXT.discard)}
          </Button>
        </div>
      ) : (
        <p
          role="status"
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          {course.can_publish ? (
            <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
          )}
          {t(
            course.status === "PUBLISHED"
              ? ADMIN_TEXT.published
              : course.status === "ARCHIVED"
                ? ADMIN_TEXT.archived
                : course.can_publish
                  ? COURSE_SETUP_TEXT.publishReady
                  : COURSE_SETUP_TEXT.publishBlocked,
          )}
        </p>
      )}
      <CourseActions
        course={course}
        publishDisabled={unsavedSteps.length > 0}
      />
    </div>
  );
};
