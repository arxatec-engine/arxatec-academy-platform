import { Button, Card, CardContent } from "arxatec-ui";
import { FileText, LockKeyhole, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { COURSE_TEXT } from "@/modules/catalog/i18n";
import type { LessonSummary } from "@/modules/catalog/types";
import { formatDuration } from "@/modules/catalog/utils";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  lessons: LessonSummary[];
  courseSlug: string;
  currentSlug?: string;
}

export const LessonList = ({ lessons, courseSlug, currentSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <Card className="gap-0 overflow-hidden rounded-md py-0 shadow-none">
      <CardContent className="px-0">
        <ol className="divide-y divide-border">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Button
                asChild
                variant="ghost"
                className="group grid h-auto w-full grid-cols-[2.5rem_1fr] items-start gap-1 rounded-md p-2 text-left whitespace-normal sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]"
              >
                <Link
                  to={RouteHelpers.lesson(courseSlug, lesson.slug)}
                  aria-current={
                    lesson.slug === currentSlug ? "page" : undefined
                  }
                >
                  <span className="row-span-2 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-sm text-muted-foreground group-hover:text-foreground">
                    {lesson.position}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">
                      {lesson.title}
                    </span>
                    {lesson.description && (
                      <span className=" block text-sm font-normal text-muted-foreground">
                        {lesson.description}
                      </span>
                    )}
                  </span>
                  <span className="col-start-2 flex flex-wrap items-center gap-2 self-center text-sm font-normal text-muted-foreground sm:col-start-auto sm:justify-end sm:pl-4">
                    {!lesson.isUnlocked ? (
                      <LockKeyhole
                        aria-label={t(COURSE_TEXT.locked)}
                        className="size-4"
                      />
                    ) : lesson.type === "VIDEO" ? (
                      <Play aria-hidden="true" className="size-4" />
                    ) : (
                      <FileText aria-hidden="true" className="size-4" />
                    )}
                    {lesson.durationSeconds
                      ? formatDuration(lesson.durationSeconds)
                      : lesson.readingMinutes
                        ? t(COURSE_TEXT.readingMinutes, {
                            count: lesson.readingMinutes,
                          })
                        : null}
                  </span>
                </Link>
              </Button>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
