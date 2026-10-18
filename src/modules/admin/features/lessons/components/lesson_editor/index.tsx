import { AsyncBoundary } from "arxatec-ui";
import { Navigate } from "react-router-dom";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { COURSE_SETUP_STEP } from "@/modules/admin/constants/course_setup";
import { useAdminLesson } from "@/modules/admin/hooks/lessons";
import { useAdminRoute } from "@/modules/admin/hooks/use_admin_route";
import { RouteHelpers } from "@/routes/routes";

export const LessonEditor = () => {
  const { id } = useAdminRoute();
  const query = useAdminLesson(id);
  if (!id) throw new Response(null, { status: 404 });
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
      ErrorComponent={<ErrorScreen />}
    >
      {(view) => (
        <Navigate
          replace
          to={RouteHelpers.adminCourse(
            view.course.id,
            COURSE_SETUP_STEP.lessons,
            view.lesson.id,
          )}
        />
      )}
    </AsyncBoundary>
  );
};
