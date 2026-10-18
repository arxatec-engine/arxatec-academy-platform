import { Badge, Card, CardContent } from "arxatec-ui";
import { BookOpen, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CourseCover } from "@/components/shared/course_cover";
import { NS } from "@/locales/namespaces";
import {
  CATALOG_TEXT,
  COURSE_LEVEL_LABELS,
  COURSE_TEXT,
  COURSE_TOPIC_LABELS,
} from "@/modules/catalog/i18n";
import type { CourseView } from "@/modules/catalog/types";
import { formatDuration } from "@/modules/catalog/utils";
import { CourseStart } from "../course_start";
import { CourseLevelIcon } from "./components/course_level_icon";

interface Props {
  view: CourseView;
}

export const CourseOverview = ({ view }: Props) => {
  const { t } = useTranslation(NS.common);
  const { course, lessons } = view;
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_21rem] lg:items-stretch lg:gap-12">
      <div className="py-2">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-sm font-normal">
            {t(COURSE_TEXT.freeCourse)}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {t(COURSE_TOPIC_LABELS[course.topic])}
          </p>
        </div>
        <h1 className="mt-4 max-w-2xl text-2xl">
          {course.title}
        </h1>
        <p className="max-w-3xl whitespace-pre-line text-sm text-muted-foreground">
          {course.longDescription}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
            <CourseLevelIcon level={course.level} />
            {t(COURSE_LEVEL_LABELS[course.level])}
          </span>
          <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
            <BookOpen aria-hidden="true" className="size-5 shrink-0" />
            {t(CATALOG_TEXT.lessonsCount, { count: course.lessonCount })}
          </span>
          <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
            <Clock3 aria-hidden="true" className="size-5 shrink-0" />
            {formatDuration(course.totalDurationSeconds)}
          </span>
        </div>
      </div>
      <aside>
        <Card className="relative isolate h-52 overflow-hidden rounded-md py-0 shadow-none sm:h-64 lg:h-full lg:min-h-48">
          <CourseCover course={course} className="absolute inset-0 size-full aspect-auto" />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
          <CardContent className="relative z-10 mt-auto p-4">
            <CourseStart courseSlug={course.slug} firstLesson={lessons[0]} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};
