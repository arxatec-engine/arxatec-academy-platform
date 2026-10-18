import { Image } from "arxatec-ui";
import type { CatalogCourse } from "@/modules/catalog/types";
import { cn } from "@/utilities/cn";
import { getCourseCover } from "./utils";

interface Props {
  course: Pick<CatalogCourse, "coverImageUrl" | "slug" | "topic">;
  className?: string;
}

export const CourseCover = ({ course, className }: Props) => {
  const fallback = getCourseCover(course);
  return (
    <div
      aria-hidden="true"
      className={cn("aspect-[16/10] overflow-hidden bg-muted", className)}
    >
      <Image
        src={course.coverImageUrl || fallback}
        errorImage={fallback}
        alt=""
        loading="lazy"
        decoding="async"
        width={960}
        height={600}
        className="size-full"
        classNameImage="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
      />
    </div>
  );
};
