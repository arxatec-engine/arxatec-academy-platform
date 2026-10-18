import type { CatalogCourse } from "@/modules/catalog/types";
import { COURSE_COVERS, TOPIC_COVERS } from "../constants";

export const getCourseCover = (
  course: Pick<CatalogCourse, "slug" | "topic">,
): string => {
  const cover = Object.hasOwn(COURSE_COVERS, course.slug)
    ? COURSE_COVERS[course.slug]
    : undefined;
  return cover ?? TOPIC_COVERS[course.topic];
};
