import { AsyncBoundary, StatusMessage } from "arxatec-ui";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { useMyCourses } from "@/modules/progress/hooks";
import { PROGRESS_TEXT } from "@/modules/progress/i18n";
import { MyCourseCard } from "../my_course_card";

export const MyCoursesContent = () => {
  const { t } = useTranslation(NS.common);
  const query = useMyCourses();
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
      ErrorComponent={<ErrorScreen />}
    >
      {(courses) =>
        courses.inProgress.length === 0 && courses.completed.length === 0 ? (
          <div className="space-y-3">
            <StatusMessage
              size="sm"
              color="white"
              icon={BookOpen}
              title={t(PROGRESS_TEXT.myCourses)}
              description={t(PROGRESS_TEXT.empty)}
            />
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {courses.inProgress.map((entry) => (
              <MyCourseCard
                key={entry.course.slug}
                entry={entry}
                completed={false}
              />
            ))}
            {courses.completed.map((entry) => (
              <MyCourseCard key={entry.course.slug} entry={entry} completed />
            ))}
          </div>
        )
      }
    </AsyncBoundary>
  );
};
