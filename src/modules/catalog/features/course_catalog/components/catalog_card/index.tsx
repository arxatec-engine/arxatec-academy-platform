import { Button, Card, CardContent, CardFooter } from "arxatec-ui";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CourseCover } from "@/components/shared/course_cover";
import { NS } from "@/locales/namespaces";
import {
  CATALOG_TEXT,
  COURSE_LEVEL_LABELS,
  COURSE_TOPIC_LABELS,
} from "@/modules/catalog/i18n";
import type { CatalogCourse } from "@/modules/catalog/types";
import { formatDuration } from "@/modules/catalog/utils";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  course: CatalogCourse;
}

export const CatalogCard = ({ course }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <Button
      asChild
      variant="ghost"
      className="group block h-full min-w-0 rounded-md p-0 text-left whitespace-normal font-normal hover:bg-transparent"
    >
      <Link
        to={RouteHelpers.course(course.slug)}
        aria-label={`${t(CATALOG_TEXT.viewCourse)}: ${course.title}`}
      >
        <Card className="h-full gap-0 overflow-hidden rounded-md py-0 shadow-none transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/25 group-hover:shadow-sm">
          <CourseCover course={course} />
          <CardContent className="flex flex-1 flex-col px-3 pt-3">
            <p className="text-sm text-foreground">
              {t(COURSE_TOPIC_LABELS[course.topic])} ·{" "}
              {t(COURSE_LEVEL_LABELS[course.level])}
            </p>
            <h2 className="line-clamp-2 mt-2 text-base font-normal">
              {course.title}
            </h2>
            <p className="line-clamp-2 min-h-12 text-sm leading-relaxed text-muted-foreground">
              {course.shortDescription}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen aria-hidden="true" className="size-4" />
                {t(CATALOG_TEXT.lessonsCount, { count: course.lessonCount })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-4" />
                {formatDuration(course.totalDurationSeconds)}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="sm" variant="outline">
              {t(CATALOG_TEXT.viewCourse)}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform motion-safe:group-hover:translate-x-1"
              />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </Button>
  );
};
