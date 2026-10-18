import { AsyncBoundary } from "arxatec-ui";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useAdminCourse } from "@/modules/admin/hooks";
import { useAdminRoute } from "@/modules/admin/hooks/use_admin_route";
import { CourseSetup } from "../course_setup";

export const CourseEditor = () => {
  const { id } = useAdminRoute();
  const query = useAdminCourse(id);
  if (!id) throw new Response(null, { status: 404 });
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError && !query.data}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
      ErrorComponent={<ErrorScreen />}
    >
      {(view) => <CourseSetup key={view.course.id} view={view} />}
    </AsyncBoundary>
  );
};
