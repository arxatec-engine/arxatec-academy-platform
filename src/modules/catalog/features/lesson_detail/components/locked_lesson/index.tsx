import { Button, StatusMessage } from "arxatec-ui";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LessonList } from "@/components/shared/lesson_list";
import { NS } from "@/locales/namespaces";
import { COURSE_TEXT, LESSON_TEXT } from "@/modules/catalog/i18n";
import type { LockedLessonView } from "@/modules/catalog/types";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  view: LockedLessonView;
  courseSlug: string;
}

export const LockedLesson = ({ view, courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <>
      <Button
        asChild
        variant="outline"
        className="size-7 mb-4"
      >
        <Link to={RouteHelpers.course(courseSlug)}>
          <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </Button>
        <StatusMessage
          color="white"
          icon={LockKeyhole}
          title={view.lesson.title}
        description={t(LESSON_TEXT.lockedDescription)}
        classNameCard="flex-col justify-center items-center flex py-16"
        classNameTitle="text-center w-full"
        classNameDescription="text-center w-full max-w-xs"
        />
      <section className="mt-4">
        <h2 className="text-xl font-semibold">{t(COURSE_TEXT.syllabus)}</h2>
        <div className="mt-5">
          <LessonList
            lessons={view.lessons}
            courseSlug={courseSlug}
            currentSlug={view.lesson.slug}
          />
        </div>
      </section>
    </>
  );
};
