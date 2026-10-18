import { Badge, Button, Card } from "arxatec-ui";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";
import type { LessonView } from "@/modules/catalog/types";
import { LessonComments } from "@/modules/comments/components/lesson_comments";
import { RouteHelpers } from "@/routes/routes";
import { LessonCompletion } from "../lesson_completion";
import { LessonMaterial } from "../lesson_material";
import { LessonNavigation } from "../lesson_navigation";
import { LessonResources } from "../lesson_resources";

interface Props {
  view: LessonView;
  courseSlug: string;
}

export const UnlockedLesson = ({ view, courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  const { lesson } = view;
  return (
    <>
      <div className="max-w-3xl">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="size-7">
            <Link to={RouteHelpers.course(courseSlug)}>
              <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            </Link>
          </Button>
          <Badge variant="secondary" className="text-sm font-normal">
            {t(LESSON_TEXT.position, {
              current: lesson.position,
              total: view.course.lesson_count,
            })}
          </Badge>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1">
          <h1 className="min-w-0 text-2xl font-normal [overflow-wrap:anywhere]">
            {lesson.title}
          </h1>
          <LessonCompletion lessonId={lesson.id} />
        </div>
      </div>
      <LessonMaterial lesson={lesson} />
      <Card className="mt-6 gap-0 divide-y divide-border overflow-hidden rounded-md py-0 shadow-none">
        {lesson.resources.length > 0 && (
          <LessonResources resources={lesson.resources} grouped />
        )}
        <LessonComments lessonId={lesson.id} grouped />
      </Card>
      <LessonNavigation view={view} courseSlug={courseSlug} />
    </>
  );
};
