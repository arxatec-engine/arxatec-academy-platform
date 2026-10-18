import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardFooter,
  Progress,
} from "arxatec-ui";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { EXAM_TEXT } from "@/modules/progress/i18n/exams";
import type {
  CourseCompleted,
  CourseInProgress,
} from "@/modules/progress/types";
import { RouteHelpers } from "@/routes/routes";
import { CERTIFICATE_TEXT } from "../../../certificate/i18n";

interface Props {
  entry: CourseInProgress | CourseCompleted;
  completed: boolean;
}

export const MyCourseCard = ({ entry, completed }: Props) => {
  const { t } = useTranslation(NS.common);
  const isInProgress = "completedLessons" in entry;
  const destination =
    isInProgress && entry.nextLesson
      ? RouteHelpers.lesson(entry.course.slug, entry.nextLesson.slug)
      : RouteHelpers.course(entry.course.slug);
  const percent =
    isInProgress && entry.lessonCount > 0
      ? (entry.completedLessons / entry.lessonCount) * 100
      : 100;
  return (
    <Card className="h-full gap-0 rounded-md py-0 shadow-none">
      <CardContent className="flex flex-1 flex-col p-3 pb-0">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="text-sm font-normal">
            {t(completed ? PROGRESS_TEXT.completed : PROGRESS_TEXT.inProgress)}
          </Badge>
        </div>
        <h3 className="text-base leading-snug tracking-tight">
          {entry.course.title}
        </h3>
        <p className="mt-auto text-sm text-muted-foreground">
          {isInProgress
            ? t(PROGRESS_TEXT.lessonsDone, {
                completed: entry.completedLessons,
                total: entry.lessonCount,
              })
            : t(PROGRESS_TEXT.completedLessons, { count: entry.lessonCount })}
        </p>
        {isInProgress && (
          <Progress
            value={percent}
            aria-label={entry.course.title}
            className="mt-3 h-1.5"
          />
        )}
      </CardContent>
      <CardFooter>
        <ButtonGroup aria-label={entry.course.title} className="w-full">
          <Button
            size="sm"
            asChild
            variant={completed ? "outline" : "default"}
            className="flex-1"
          >
            <Link to={destination}>
              {t(completed ? PROGRESS_TEXT.review : PROGRESS_TEXT.continue)}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          {entry.certificateId && (
            <Button size="sm" asChild variant="outline" className="flex-1">
              <Link to={RouteHelpers.certificate(entry.certificateId)}>
                {t(CERTIFICATE_TEXT.view)}
              </Link>
            </Button>
          )}
          {completed && !entry.certificateId && (
            <Button size="sm" asChild variant="outline" className="flex-1">
              <Link to={RouteHelpers.exam(entry.course.slug)}>
                {t(EXAM_TEXT.take)}
              </Link>
            </Button>
          )}
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};
