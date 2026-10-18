import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { Accessibility } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { AsyncBoundary } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import { CATALOG_TEXT } from "@/modules/catalog/i18n";
import { useCourseSorting } from "../../hooks/use_course_sorting";
import { CourseCard } from "../course_card";

export const CourseList = () => {
  const { t } = useTranslation(NS.common);
  const {
    query,
    courses,
    activeCount,
    isSaving,
    accessibility,
    startDrag,
    endDrag,
    move,
  } = useCourseSorting();

  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError && !query.data}
      data={query.data}
      LoadingComponent={<LoadingScreen className="mt-5" />}
      ErrorComponent={<ErrorScreen />}
    >
      {(data) => (
        <section className="mt-5 space-y-3" aria-label={t(ADMIN_TEXT.courses)}>
          <p className="text-sm text-muted-foreground" role="status">
            {t(CATALOG_TEXT.coursesCount, { count: data.courses.length })}
          </p>
          {courses.length === 0 && (
            <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              {t(CATALOG_TEXT.noCourses)}
            </p>
          )}
          <DragDropProvider
            modifiers={[RestrictToVerticalAxis]}
            plugins={(defaults) =>
              defaults.map((plugin) =>
                plugin === Accessibility ? accessibility : plugin,
              )
            }
            onDragStart={startDrag}
            onDragEnd={endDrag}
          >
            <ol
              className="space-y-2"
              aria-label={t(ADMIN_TEXT.courses)}
              aria-busy={isSaving}
            >
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  activeCount={activeCount}
                  isSaving={isSaving}
                  onMove={move}
                />
              ))}
            </ol>
          </DragDropProvider>
        </section>
      )}
    </AsyncBoundary>
  );
};
