import { AsyncBoundary } from "arxatec-ui";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useCourse } from "@/modules/catalog/hooks";
import { useCatalogRoute } from "@/modules/catalog/hooks/use_catalog_route";
import { CourseOverview } from "../course_overview";
import { CourseSyllabus } from "../course_syllabus";
import { CourseTeacher } from "../course_teacher";

export const CourseContent = () => {
  const { slug } = useCatalogRoute();
  const query = useCourse(slug);
  if (!slug) throw new Response(null, { status: 404 });
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
      ErrorComponent={<ErrorScreen />}
    >
      {(view) => (
        <>
          <CourseOverview view={view} />
          <CourseSyllabus view={view} />
          <CourseTeacher teacher={view.course.teacher} />
        </>
      )}
    </AsyncBoundary>
  );
};
