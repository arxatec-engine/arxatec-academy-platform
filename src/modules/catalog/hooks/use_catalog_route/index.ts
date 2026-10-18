import { useParams } from "react-router-dom";

export const useCatalogRoute = () => {
  const {
    slug,
    course_slug: courseSlug,
    lesson_slug: lessonSlug,
  } = useParams<"slug" | "course_slug" | "lesson_slug">();
  return { slug, courseSlug, lessonSlug };
};
