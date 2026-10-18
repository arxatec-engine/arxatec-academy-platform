import { Button } from "arxatec-ui";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NS } from "@/locales/namespaces";
import { COURSE_TEXT } from "@/modules/catalog/i18n";
import type { LessonSummary } from "@/modules/catalog/types";
import { useEnrollCourse } from "@/modules/progress/hooks";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

interface Props {
  courseSlug: string;
  firstLesson?: LessonSummary;
}

export const CourseStart = ({ courseSlug, firstLesson }: Props) => {
  const { t } = useTranslation(NS.common);
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const enroll = useEnrollCourse();
  if (!firstLesson) return null;
  const destination = RouteHelpers.lesson(courseSlug, firstLesson.slug);
  const start = () => {
    void toast.promise(
      enroll.mutateAsync(courseSlug).then(() => navigate(destination)),
      {
        loading: t(COURSE_TEXT.start),
        success: t(COURSE_TEXT.start),
        error: t(COURSE_TEXT.enrollFailed),
      },
    );
  };
  return user === null ? (
    <Button asChild size="sm" className="w-full">
      <Link to={destination}>
        {t(COURSE_TEXT.start)}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  ) : (
    <Button
      type="button"
      size="sm"
      className="w-full"
      disabled={enroll.isPending}
      onClick={start}
    >
      {t(COURSE_TEXT.start)}
      <ArrowRight className="size-4" />
    </Button>
  );
};
