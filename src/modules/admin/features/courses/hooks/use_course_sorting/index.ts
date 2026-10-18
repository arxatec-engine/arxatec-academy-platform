import { Accessibility } from "@dnd-kit/dom";
import type { DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { useAdminCourses, useReorderAdminCourses } from "@/modules/admin/hooks";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourseListItem } from "@/modules/admin/types";
import { COURSE_SORTING_TEXT } from "../../i18n/course_sorting";

const describe = (
  source: NonNullable<DragEndEvent["operation"]["source"]>,
) => ({
  title: String(source.data.title ?? source.id),
  position: isSortable(source) ? source.index + 1 : 1,
  total: Number(source.data.total),
});

export const useCourseSorting = () => {
  const { t } = useTranslation(NS.common);
  const query = useAdminCourses();
  const reorder = useReorderAdminCourses();
  const [pendingCourses, setPendingCourses] = useState<
    AdminCourseListItem[] | null
  >(null);
  const savedCourses = query.data?.courses ?? [];
  const courses = pendingCourses ?? [
    ...savedCourses.filter((course) => course.status !== "ARCHIVED"),
    ...savedCourses.filter((course) => course.status === "ARCHIVED"),
  ];
  const activeCount = courses.filter(
    (course) => course.status !== "ARCHIVED",
  ).length;
  const accessibility = useMemo(
    () =>
      Accessibility.configure({
        screenReaderInstructions: {
          draggable: t(COURSE_SORTING_TEXT.instructions),
        },
        announcements: {
          dragstart: ({ operation: { source } }) =>
            source
              ? t(COURSE_SORTING_TEXT.started, describe(source))
              : undefined,
          dragover: ({ operation: { source } }) =>
            source ? t(COURSE_SORTING_TEXT.moved, describe(source)) : undefined,
          dragend: ({ operation: { source }, canceled }) =>
            source
              ? t(
                  canceled
                    ? COURSE_SORTING_TEXT.canceled
                    : COURSE_SORTING_TEXT.dropped,
                  describe(source),
                )
              : undefined,
        },
      } satisfies NonNullable<ConstructorParameters<typeof Accessibility>[1]>),
    [t],
  );

  const saveOrder = (next: AdminCourseListItem[]) => {
    if (reorder.isPending) return;
    setPendingCourses(next);
    const ids = next
      .filter((course) => course.status !== "ARCHIVED")
      .map((course) => course.id);
    void toast.promise(
      reorder.mutateAsync(ids).finally(() => setPendingCourses(null)),
      {
        loading: t(ADMIN_TEXT.save),
        success: t(ADMIN_TEXT.saved),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  const move = (from: number, to: number) => {
    if (
      reorder.isPending ||
      from === to ||
      from < 0 ||
      from >= activeCount ||
      to < 0 ||
      to >= activeCount
    )
      return;
    const next = [...courses];
    const [course] = next.splice(from, 1);
    next.splice(to, 0, course!);
    saveOrder(next);
  };
  const endDrag = ({
    operation: { source, target },
    canceled,
  }: DragEndEvent) => {
    if (
      canceled ||
      !target ||
      !isSortable(source) ||
      source.initialIndex === source.index
    ) {
      setPendingCourses(null);
      return;
    }
    if (source.index < 0 || source.index >= activeCount) {
      setPendingCourses(null);
      return;
    }
    move(source.initialIndex, source.index);
  };

  return {
    query,
    courses,
    activeCount,
    isSaving: reorder.isPending,
    accessibility,
    startDrag: () => setPendingCourses(courses),
    endDrag,
    move,
  };
};
