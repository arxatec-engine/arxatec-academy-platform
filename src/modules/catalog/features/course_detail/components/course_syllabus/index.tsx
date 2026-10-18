import { Button, Card, CardContent } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UI_TEXT } from "@/components/shared/i18n";
import { LessonList } from "@/components/shared/lesson_list";
import { NoticeSignupForm } from "@/components/shared/notice_signup_form";
import { NS } from "@/locales/namespaces";
import { COURSE_TEXT } from "@/modules/catalog/i18n";
import type { CourseView } from "@/modules/catalog/types";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  view: CourseView;
}

export const CourseSyllabus = ({ view }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <section className="mt-4" aria-labelledby="course-syllabus">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2
          id="course-syllabus"
          className="text-lg"
        >
          {t(COURSE_TEXT.syllabus)}
        </h2>
      </div>
      {view.lessons.length === 0 ? (
        <Card className="border-dashed py-8 shadow-none">
          <CardContent className="text-center">
            <p className="text-muted-foreground">{t(COURSE_TEXT.noLessons)}</p>
            <div className="mx-auto mt-5 max-w-md text-left">
              <NoticeSignupForm courseSlug={view.course.slug} />
            </div>
            <Button size="sm" asChild variant="outline" className="mt-4">
              <Link to={RouteHelpers.home()}>{t(UI_TEXT.goToCatalog)}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <LessonList lessons={view.lessons} courseSlug={view.course.slug} />
      )}
    </section>
  );
};
