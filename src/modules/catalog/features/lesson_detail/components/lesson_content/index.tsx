import { AsyncBoundary } from "arxatec-ui";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { useLesson } from "@/modules/catalog/hooks";
import { useCatalogRoute } from "@/modules/catalog/hooks/use_catalog_route";
import { LockedLesson } from "../locked_lesson";
import { UnlockedLesson } from "../unlocked_lesson";

export const LessonContent = () => {
  const { courseSlug, lessonSlug } = useCatalogRoute();
  const query = useLesson(courseSlug, lessonSlug);
  if (!courseSlug || !lessonSlug) throw new Response(null, { status: 404 });
  if (query.isError) throw query.error;
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={<LoadingScreen />}
    >
      {(view) =>
        view.locked ? (
          <LockedLesson view={view} courseSlug={courseSlug} />
        ) : (
          <UnlockedLesson view={view} courseSlug={courseSlug} />
        )
      }
    </AsyncBoundary>
  );
};
