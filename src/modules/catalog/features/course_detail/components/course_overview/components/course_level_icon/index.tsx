import type { CourseLevel } from "@/modules/catalog/types";

interface Props {
  level: CourseLevel;
}

export const CourseLevelIcon = ({ level }: Props) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5 shrink-0 text-foreground"
  >
    <rect x="2" y="14" width="5" height="8" rx="1" />
    <rect
      x="9.5"
      y="8"
      width="5"
      height="14"
      rx="1"
      opacity={level === "INTERMEDIATE" ? 1 : 0.25}
    />
    <rect x="17" y="2" width="5" height="20" rx="1" opacity="0.25" />
  </svg>
);
