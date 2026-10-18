import { useSortable } from "@dnd-kit/react/sortable";
import { Badge, Button, Separator } from "arxatec-ui";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { ADMIN_TEXT } from "@/modules/admin/i18n";
import type { AdminCourseListItem } from "@/modules/admin/types";
import {
  COURSE_LEVEL_LABELS,
  COURSE_TOPIC_LABELS,
} from "@/modules/catalog/i18n";
import { RouteHelpers } from "@/routes/routes";
import { cn } from "@/utilities/cn";
import { COURSE_SORTING_TEXT } from "../../i18n/course_sorting";

interface Props {
  course: AdminCourseListItem;
  index: number;
  activeCount: number;
  isSaving: boolean;
  onMove: (from: number, to: number) => void;
}

export const CourseCard = ({
  course,
  index,
  activeCount,
  isSaving,
  onMove,
}: Props) => {
  const { t } = useTranslation(NS.common);
  const archived = course.status === "ARCHIVED";
  const disabled = isSaving || archived || activeCount < 2;
  const { ref, isDragging } = useSortable({
    id: course.id,
    index,
    disabled,
    data: { title: course.title, total: activeCount },
  });

  return (
    <li
      ref={ref}
      role="listitem"
      tabIndex={disabled ? -1 : 0}
      aria-label={t(COURSE_SORTING_TEXT.handle, { title: course.title })}
      aria-roledescription={t(COURSE_SORTING_TEXT.sortable)}
      className={cn(
        "min-w-0 rounded-md border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !disabled && "cursor-grab active:cursor-grabbing",
        isDragging && "relative z-10 shadow-lg ring-1 ring-ring",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">
            {t(COURSE_TOPIC_LABELS[course.topic])} ·{" "}
            {t(COURSE_LEVEL_LABELS[course.level])}
          </p>
          <h2 className="text-base leading-snug font-normal">
            <Link
              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring [overflow-wrap:anywhere]"
              to={RouteHelpers.adminCourse(course.id)}
              draggable={false}
            >
              {course.title}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {course.slug}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={course.status === "PUBLISHED" ? "outline" : "secondary"}
            className="font-normal"
          >
            {t(
              course.status === "PUBLISHED"
                ? ADMIN_TEXT.published
                : archived
                  ? ADMIN_TEXT.archived
                  : ADMIN_TEXT.draft,
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t(ADMIN_TEXT.lessons)}: {course.published_lesson_count}/
            {course.lesson_count}
          </span>
        </div>
        {!archived && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="size-8 p-0 text-muted-foreground"
              aria-label={`${t(ADMIN_TEXT.moveUp)}: ${course.title}`}
              title={t(ADMIN_TEXT.moveUp)}
              disabled={isSaving || index === 0}
              onClick={() => onMove(index, index - 1)}
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="size-8 p-0 text-muted-foreground"
              aria-label={`${t(ADMIN_TEXT.moveDown)}: ${course.title}`}
              title={t(ADMIN_TEXT.moveDown)}
              disabled={isSaving || index === activeCount - 1}
              onClick={() => onMove(index, index + 1)}
            >
              <ArrowDown aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};
