import { AsyncBoundary } from "arxatec-ui";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useCourse } from "@/modules/catalog/hooks";
import { useCatalogRoute } from "@/modules/catalog/hooks/use_catalog_route";
import { CourseCertification } from "@/modules/progress/components/course_certification";
import { CourseOverview } from "../course_overview";
import { CourseSyllabus } from "../course_syllabus";
import { CourseTeacher } from "../course_teacher";

export const CourseContent = () => {
  const { slug } = useCatalogRoute();
  const query = useCourse(slug);
  if (!slug) throw new Response(null, { status: 404 });
  if (query.isError) throw query.error;
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
    >
      {(view) => (
        <>
          <CourseOverview view={view} />
          <CourseCertification courseSlug={slug} />
          <CourseSyllabus view={view} />
          <CourseTeacher teacher={view.course.teacher} />
        </>
      )}
    </AsyncBoundary>
  );
};
