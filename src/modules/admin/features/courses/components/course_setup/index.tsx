import { useIsMutating } from "@tanstack/react-query";
import { Badge, Button } from "arxatec-ui";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import {
  COURSE_SETUP_STEP,
  type CourseSetupStep,
} from "@/modules/admin/constants/course_setup";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourseView } from "@/modules/admin/types";
import { ROUTE_QUERY_PARAM_NAMES, RouteHelpers } from "@/routes/routes";
import { cn } from "@/utilities/cn";
import { COURSE_SETUP_TEXT } from "../../i18n/course_setup";
import { CourseCoverForm } from "../course_cover_form";
import { CourseEditForm } from "../course_edit_form";
import { CourseExam } from "../course_exam";
import { CourseLessons } from "../course_lessons";
import { CoursePublication } from "../course_publication";
import { CourseStepActions } from "../course_step_actions";

const steps = [
  {
    id: COURSE_SETUP_STEP.details,
    title: COURSE_SETUP_TEXT.details,
    hint: COURSE_SETUP_TEXT.detailsHint,
  },
  {
    id: COURSE_SETUP_STEP.teacher,
    title: ADMIN_TEXT.teacher,
    hint: COURSE_SETUP_TEXT.teacherHint,
  },
  {
    id: COURSE_SETUP_STEP.cover,
    title: ADMIN_TEXT.cover,
    hint: COURSE_SETUP_TEXT.coverHint,
  },
  {
    id: COURSE_SETUP_STEP.lessons,
    title: ADMIN_TEXT.lessons,
    hint: COURSE_SETUP_TEXT.lessonsHint,
  },
  {
    id: COURSE_SETUP_STEP.exam,
    title: COURSE_SETUP_TEXT.exam,
    hint: COURSE_SETUP_TEXT.examHint,
  },
  {
    id: COURSE_SETUP_STEP.publication,
    title: COURSE_SETUP_TEXT.publication,
    hint: COURSE_SETUP_TEXT.publicationHint,
  },
] as const;

export const CourseSetup = ({ view }: { view?: AdminCourseView }) => {
  const { t } = useTranslation(NS.common);
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const step =
    (view &&
      steps.find(
        (entry) => entry.id === search.get(ROUTE_QUERY_PARAM_NAMES.course_step),
      )) ||
    steps[0];
  const index = steps.indexOf(step);
  const [visited, setVisited] = useState<Set<CourseSetupStep>>(
    () => new Set([step.id]),
  );
  const [dirty, setDirty] = useState<Set<CourseSetupStep>>(() => new Set());
  const isSaving = useIsMutating() > 0;
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step.id]);

  const goTo = (next: CourseSetupStep) => {
    if (isSaving || (!view && next !== COURSE_SETUP_STEP.details)) return;
    setVisited((current) => new Set([...current, step.id, next]));
    setSearch(
      (current) => {
        const updated = new URLSearchParams(current);
        updated.set(ROUTE_QUERY_PARAM_NAMES.course_step, next);
        return updated;
      },
      { replace: true },
    );
  };
  const markDirty = (id: CourseSetupStep, changed: boolean) => {
    setDirty((current) => {
      if (current.has(id) === changed) return current;
      const next = new Set(current);
      if (changed) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const content = (id: CourseSetupStep) => {
    if (!view) {
      if (id !== COURSE_SETUP_STEP.details) return null;
      return (
        <CourseEditForm
          section="details"
          onContinue={(created) => {
            void navigate(
              RouteHelpers.adminCourse(
                created.course.id,
                COURSE_SETUP_STEP.teacher,
              ),
              { replace: true },
            );
          }}
          onDirtyChange={(changed) => markDirty(id, changed)}
        />
      );
    }
    switch (id) {
      case COURSE_SETUP_STEP.details:
      case COURSE_SETUP_STEP.teacher:
        return (
          <CourseEditForm
            course={view.course}
            section={id}
            onBack={
              id === COURSE_SETUP_STEP.teacher
                ? () => goTo(COURSE_SETUP_STEP.details)
                : undefined
            }
            onContinue={() =>
              goTo(
                id === COURSE_SETUP_STEP.details
                  ? COURSE_SETUP_STEP.teacher
                  : COURSE_SETUP_STEP.cover,
              )
            }
            onDirtyChange={(changed) => markDirty(id, changed)}
          />
        );
      case COURSE_SETUP_STEP.cover:
        return (
          <CourseCoverForm
            course={view.course}
            onBack={() => goTo(COURSE_SETUP_STEP.teacher)}
            onContinue={() => goTo(COURSE_SETUP_STEP.lessons)}
            onDirtyChange={(changed) => markDirty(id, changed)}
          />
        );
      case COURSE_SETUP_STEP.lessons:
        return (
          <div className="space-y-5">
            <CourseLessons
              view={view}
              embedded
              onDirtyChange={(changed) => markDirty(id, changed)}
            />
            <CourseStepActions
              onBack={() => goTo(COURSE_SETUP_STEP.cover)}
              onNext={() => goTo(COURSE_SETUP_STEP.exam)}
              disabled={isSaving}
            />
          </div>
        );
      case COURSE_SETUP_STEP.exam:
        return (
          <div className="space-y-5">
            <CourseExam
              course={view.course}
              embedded
              onDirtyChange={(changed) => markDirty(id, changed)}
            />
            <CourseStepActions
              onBack={() => goTo(COURSE_SETUP_STEP.lessons)}
              onNext={() => goTo(COURSE_SETUP_STEP.publication)}
              disabled={isSaving}
            />
          </div>
        );
      case COURSE_SETUP_STEP.publication:
        return (
          <div className="space-y-5">
            <CoursePublication
              view={view}
              unsavedSteps={steps
                .filter((entry) => dirty.has(entry.id))
                .map((entry) => ({ id: entry.id, title: t(entry.title) }))}
              onEdit={goTo}
              onDiscard={() => {
                setVisited(new Set([COURSE_SETUP_STEP.publication]));
                setDirty(new Set());
              }}
            />
            <CourseStepActions
              onBack={() => goTo(COURSE_SETUP_STEP.exam)}
              onNext={() => void navigate(RouteHelpers.adminCourses())}
              disabled={isSaving}
              nextDisabled={dirty.size > 0}
              label={t(COURSE_SETUP_TEXT.finish)}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-w-0 space-y-5">
      <header className="space-y-2 pr-10">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 text-2xl font-normal [overflow-wrap:anywhere]">
            {view?.course.title ?? t(ADMIN_TEXT.create)}
          </h1>
          {view && (
            <Badge variant="secondary" className="font-normal">
              {t(
                view.course.status === "PUBLISHED"
                  ? ADMIN_TEXT.published
                  : view.course.status === "ARCHIVED"
                    ? ADMIN_TEXT.archived
                    : ADMIN_TEXT.draft,
              )}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t(COURSE_SETUP_TEXT.title)}
        </p>
      </header>
      <nav aria-label={t(COURSE_SETUP_TEXT.navigation)}>
        <ol className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {steps.map((entry, position) => (
            <li key={entry.id} className="min-w-0">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-current={entry.id === step.id ? "step" : undefined}
                disabled={
                  isSaving || (!view && entry.id !== COURSE_SETUP_STEP.details)
                }
                onClick={() => goTo(entry.id)}
                className={cn(
                  "h-full w-full flex-col gap-2 px-1 py-3 text-xs font-normal whitespace-normal",
                  entry.id === step.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md border border-border text-sm",
                    entry.id === step.id &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {position + 1}
                </span>
                {t(entry.title)}
                {dirty.has(entry.id) && (
                  <span className="sr-only">
                    {t(COURSE_SETUP_TEXT.unsaved)}
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ol>
      </nav>
      <section
        aria-labelledby={headingId}
        className="min-w-0 space-y-5"
      >
        <header className="space-y-2">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {t(COURSE_SETUP_TEXT.step, {
              current: index + 1,
              total: steps.length,
            })}
          </p>
          <h2
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-normal outline-none"
          >
            {t(step.title)}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(step.hint)}
          </p>
        </header>
        {steps.map((entry) =>
          visited.has(entry.id) || entry.id === step.id ? (
            <div key={entry.id} hidden={entry.id !== step.id}>
              {content(entry.id)}
            </div>
          ) : null,
        )}
      </section>
    </div>
  );
};
